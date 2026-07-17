-- Cupons de desconto + rastreio em pedidos

CREATE TYPE coupon_type AS ENUM ('percentual', 'fixo', 'frete_gratis');

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT NOT NULL UNIQUE,
  tipo coupon_type NOT NULL DEFAULT 'percentual',
  valor DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (valor >= 0),
  uso_maximo INTEGER,
  uso_atual INTEGER NOT NULL DEFAULT 0 CHECK (uso_atual >= 0),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  valido_ate TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS desconto DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cupom_codigo TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS codigo_rastreio TEXT;

CREATE INDEX IF NOT EXISTS idx_coupons_codigo ON coupons(codigo);
CREATE INDEX IF NOT EXISTS idx_orders_codigo_rastreio ON orders(codigo_rastreio) WHERE codigo_rastreio IS NOT NULL;

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage coupons" ON coupons
  FOR ALL USING (is_admin());

CREATE OR REPLACE FUNCTION validate_coupon(p_codigo TEXT)
RETURNS JSONB AS $$
DECLARE
  c coupons%ROWTYPE;
BEGIN
  SELECT * INTO c FROM coupons
  WHERE UPPER(codigo) = UPPER(TRIM(p_codigo)) AND ativo = TRUE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Cupom inválido');
  END IF;

  IF c.valido_ate IS NOT NULL AND c.valido_ate < NOW() THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Cupom expirado');
  END IF;

  IF c.uso_maximo IS NOT NULL AND c.uso_atual >= c.uso_maximo THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Cupom esgotado');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'id', c.id,
    'codigo', c.codigo,
    'tipo', c.tipo,
    'valor', c.valor
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION increment_coupon_usage(p_codigo TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons
  SET uso_atual = uso_atual + 1
  WHERE UPPER(codigo) = UPPER(TRIM(p_codigo));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION validate_coupon(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_coupon_usage(TEXT) TO authenticated;

INSERT INTO coupons (codigo, tipo, valor, uso_maximo, ativo) VALUES
  ('ULTHOR10', 'percentual', 10, 100, TRUE),
  ('FRETEGRATIS', 'frete_gratis', 0, NULL, TRUE)
ON CONFLICT (codigo) DO NOTHING;
