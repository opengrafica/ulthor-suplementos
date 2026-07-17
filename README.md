# ULTHOR SUPLEMENTOS

E-commerce profissional de suplementos alimentares construído com React, Vite, TypeScript, Tailwind CSS e Supabase.

## Tecnologias

- **React 19** + **Vite 6** + **TypeScript**
- **Tailwind CSS** — design premium (preto, dourado, branco)
- **Supabase** — autenticação, banco de dados e storage
- **React Router 7** — rotas protegidas e URLs amigáveis
- **Zustand** — gerenciamento de estado (carrinho, auth, favoritos)
- **Framer Motion** — animações suaves
- **Lucide React** — ícones
- **Recharts** — gráficos do dashboard admin

## Funcionalidades

### Site Público
- Página inicial com banner, categorias e produtos em destaque
- Catálogo com busca e filtros (nome, categoria, preço)
- Página de produto com descrição, benefícios, estoque e avaliações
- Carrinho com persistência local

### Área do Cliente
- Cadastro, login e recuperação de senha
- Perfil, foto, endereço e alteração de senha
- Histórico de pedidos e favoritos

### Painel Administrativo
- Dashboard com métricas e gráficos
- CRUD de produtos, categorias e banners
- Gestão de pedidos e status
- Listagem de usuários
- Relatórios com exportação CSV

## Início Rápido

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Iniciar em desenvolvimento
npm run dev
```

### Modo Demo (sem Supabase)

O sistema funciona imediatamente com dados de demonstração. Acesse:

- **Admin:** `admin@ulthor.com` / `123456`
- **Cliente:** qualquer e-mail / qualquer senha (6+ caracteres)

## Configuração Supabase

Projeto configurado: **ulthor-suplementos** (região São Paulo)

1. O arquivo `.env` já está configurado localmente (não commitar)
2. Schema aplicado via migrations em `supabase/schema.sql`
3. Dados iniciais: 8 categorias, 8 produtos, 3 banners

### Contato da loja
- Instagram: [@ulthorsuplementos](https://instagram.com/ulthorsuplementos)
- Email: ulthorsuplementos@gmail.com
- WhatsApp: (11) 92473-0574

### Criar admin
Registre via Auth no site ou Supabase Dashboard:
- Email: `admin@ulthor.com`
- Senha: (sua escolha, mín. 6 caracteres)

Depois execute no SQL Editor:
```sql
UPDATE users SET role = 'admin', nome = 'Administrador' WHERE email = 'admin@ulthor.com';
```

## GitHub (próximo passo)

Quando quiser conectar ao GitHub, peça para criar o repositório e fazer o push.

## Estrutura do Projeto

```
src/
├── components/     # UI, layout, produtos, carrinho
├── pages/          # Páginas públicas, auth, cliente, admin
├── services/       # Supabase e APIs
├── stores/         # Zustand (cart, auth, favorites)
├── types/          # TypeScript types
├── lib/            # Utils, validações, constantes
└── integrations/   # Placeholders para pagamentos futuros
```

## Integrações Futuras

Estrutura preparada para:
- Mercado Pago, Stripe, PIX
- WhatsApp, Correios, Melhor Envio
- Notificações push, fidelidade, cupons, afiliados, app mobile

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |

## Licença

Projeto privado — ULTHOR SUPLEMENTOS © 2026
