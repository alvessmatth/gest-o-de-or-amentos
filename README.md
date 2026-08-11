# Gestão de Orçamentos

Aplicação Next.js para gestão de orçamentos, clientes, serviços e parceiros, com autenticação e persistência via Supabase.

## Rodando localmente (fora do v0)

1. Instale as dependências:

   ```bash
   npm install
   # ou: pnpm install
   ```

2. Configure as variáveis de ambiente. Copie `.env.example` para `.env.local` e preencha com os dados do seu projeto Supabase:

   ```bash
   cp .env.example .env.local
   ```

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
   ```

   Os valores estão no painel do Supabase em **Project Settings > API**.

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse [http://localhost:3000](http://localhost:3000).

> Sem as variáveis do Supabase a aplicação ainda carrega, mas as operações de dados (login e CRUD) ficam indisponíveis.

## Credenciais de teste

- **E-mail:** admin@teste.com
- **Senha:** 123456

## Scripts

- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build de produção
- `npm run start` — serve o build de produção
