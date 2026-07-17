-- ULTHOR SUPLEMENTOS - Schema Supabase
-- Execute este script no SQL Editor do Supabase

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para roles
CREATE TYPE user_role AS ENUM ('admin', 'customer');

-- Enum para status de pedidos
CREATE TYPE order_status AS ENUM (
  'recebido',
  'em_separacao',
  'enviado',
  'entregue',
  'cancelado'
);

-- Tabela de perfis de usuários (estende auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  foto TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  endereco JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  beneficios TEXT[] DEFAULT '{}',
  modo_uso TEXT,
  preco DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
  estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  categoria TEXT NOT NULL,
  imagens TEXT[] DEFAULT '{}',
  destaque BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  imagem TEXT NOT NULL,
  link TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subtotal DECIMAL(10,2),
  frete DECIMAL(10,2) DEFAULT 0,
  desconto DECIMAL(10,2) DEFAULT 0,
  cupom_codigo TEXT,
  codigo_rastreio TEXT,
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  status order_status NOT NULL DEFAULT 'recebido',
  metodo_envio TEXT,
  prazo_entrega_dias INTEGER,
  endereco_entrega JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cupons de desconto
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

-- Itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Avaliações
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Favoritos
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_categoria ON products(categoria);
CREATE INDEX IF NOT EXISTS idx_products_destaque ON products(destaque) WHERE destaque = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_ativo ON products(ativo) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Função para criar perfil ao registrar
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'customer'::public.user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Permissões para roles do Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Função helper para verificar admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (is_admin());

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (ativo = TRUE OR is_admin());

CREATE POLICY "Admin can insert products" ON products
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admin can update products" ON products
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admin can delete products" ON products
  FOR DELETE USING (is_admin());

-- Categories policies
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (TRUE);

CREATE POLICY "Admin can manage categories" ON categories
  FOR ALL USING (is_admin());

-- Banners policies
CREATE POLICY "Anyone can view active banners" ON banners
  FOR SELECT USING (ativo = TRUE OR is_admin());

CREATE POLICY "Admin can manage banners" ON banners
  FOR ALL USING (is_admin());

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update orders" ON orders
  FOR UPDATE USING (is_admin());

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_admin()))
  );

CREATE POLICY "Users can insert order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Dados iniciais: Categorias
INSERT INTO categories (nome, slug) VALUES
  ('Whey Protein', 'whey-protein'),
  ('Creatina', 'creatina'),
  ('Pré-Treino', 'pre-treino'),
  ('Hipercalórico', 'hipercalorico'),
  ('Vitaminas', 'vitaminas'),
  ('Emagrecedores', 'emagrecedores'),
  ('Ganho de Massa', 'ganho-de-massa'),
  ('Acessórios', 'acessorios')
ON CONFLICT (slug) DO NOTHING;

-- Produtos de exemplo
INSERT INTO products (nome, slug, descricao, beneficios, modo_uso, preco, estoque, categoria, imagens, destaque, ativo) VALUES
  ('Whey Protein Gold 900g', 'whey-protein-gold-900g', 'Whey protein concentrado de alta qualidade com 24g de proteína por dose.', ARRAY['Aumento de massa muscular', 'Recuperação pós-treino', 'Alto teor proteico'], 'Misture 1 scoop (30g) em 200ml de água ou leite. Consumir após o treino.', 149.90, 50, 'Whey Protein', ARRAY['https://images.unsplash.com/photo-1593095948071-474c5cc2989f?w=600'], TRUE, TRUE),
  ('Creatina Monohidratada 300g', 'creatina-monohidratada-300g', 'Creatina pura monohidratada para aumento de força e performance.', ARRAY['Aumento de força', 'Melhora de performance', 'Recuperação muscular'], 'Consumir 1 scoop (5g) diluído em água, preferencialmente pós-treino.', 89.90, 80, 'Creatina', ARRAY['https://images.unsplash.com/photo-1579722821275-0aa034a1e994?w=600'], TRUE, TRUE),
  ('Pré-Treino Thunder 300g', 'pre-treino-thunder-300g', 'Pré-treino explosivo com cafeína, beta-alanina e arginina.', ARRAY['Energia e foco', 'Pump muscular', 'Resistência'], 'Consumir 1 scoop (10g) 30 minutos antes do treino.', 119.90, 35, 'Pré-Treino', ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600'], TRUE, TRUE),
  ('Hipercalórico Mass 3kg', 'hipercalorico-mass-3kg', 'Hipercalórico completo para ganho de peso e massa muscular.', ARRAY['Ganho de peso', 'Calorias extras', 'Carboidratos complexos'], 'Misture 2 scoops (150g) em 400ml de leite integral. Consumir 2x ao dia.', 179.90, 25, 'Hipercalórico', ARRAY['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50e?w=600'], FALSE, TRUE),
  ('Multivitamínico Complete', 'multivitaminico-complete', 'Complexo vitamínico completo com 25 vitaminas e minerais.', ARRAY['Saúde geral', 'Imunidade', 'Energia diária'], 'Consumir 1 cápsula ao dia com uma refeição.', 69.90, 100, 'Vitaminas', ARRAY['https://images.unsplash.com/photo-1550572017-edd951aa8fdc?w=600'], FALSE, TRUE),
  ('Termogênico Burn Max', 'termogenico-burn-max', 'Termogênico avançado para acelerar o metabolismo.', ARRAY['Queima de gordura', 'Acelera metabolismo', 'Controle de apetite'], 'Consumir 2 cápsulas pela manhã em jejum.', 99.90, 40, 'Emagrecedores', ARRAY['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600'], FALSE, TRUE),
  ('BCAA 2:1:1 300g', 'bcaa-211-300g', 'Aminoácidos de cadeia ramificada para recuperação muscular.', ARRAY['Anti-catabolismo', 'Recuperação', 'Resistência'], 'Consumir 1 scoop (10g) durante ou após o treino.', 79.90, 60, 'Ganho de Massa', ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600'], TRUE, TRUE),
  ('Shaker Premium 700ml', 'shaker-premium-700ml', 'Shaker premium com compartimento para suplementos.', ARRAY['Praticidade', 'Sem vazamentos', 'BPA Free'], 'Utilize para misturar seus suplementos.', 39.90, 120, 'Acessórios', ARRAY['https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600'], FALSE, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Banners iniciais
INSERT INTO banners (titulo, subtitulo, imagem, link, ativo, ordem) VALUES
  ('FORJA SEU CORPO', 'Suplementos premium para resultados épicos', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920', '/produtos', TRUE, 1),
  ('WHEY PROTEIN GOLD', 'Até 30% OFF na linha premium', 'https://images.unsplash.com/photo-1593095948071-474c5cc2989f?w=1920', '/categorias/whey-protein', TRUE, 2),
  ('PRÉ-TREINO THUNDER', 'Energia de um deus', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920', '/categorias/pre-treino', TRUE, 3)
ON CONFLICT DO NOTHING;

-- NOTA: Para criar o admin, registre via Supabase Auth com:
-- Email: admin@ulthor.com
-- Senha: 123456
-- Depois execute:
-- UPDATE users SET role = 'admin', nome = 'Administrador' WHERE email = 'admin@ulthor.com';
