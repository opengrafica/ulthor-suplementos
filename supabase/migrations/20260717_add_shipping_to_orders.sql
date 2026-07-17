-- Migration: add shipping fields to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS frete DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS metodo_envio TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS prazo_entrega_dias INTEGER;
