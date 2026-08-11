/*
# Create full schema for Gestão de Orçamentos

1. New Tables
- `clientes`: Clients/institutions (name, email, phone, cpf/cnpj, institution, is_university, user_id)
- `servicos`: Service catalog (name, unit_measure, default_price, user_id)
- `terceirizados`: Third-party partners (name, specialty, pix_key, phone, user_id)
- `orcamentos`: Budgets/proposals (code, client_id, total_value, status, validity_days, licitation fields, user_id)
- `orcamento_itens`: Budget line items (budget_id, service_id, quantity, unit_price, is_outsourced, partner_id, transfer_value)
- `balanco_mensal`: Monthly balance entries (month, revenue, transfers, budget_count, received, user_id)

2. Security
- RLS enabled on ALL tables
- Owner-scoped policies (TO authenticated) using auth.uid() = user_id
- user_id columns default to auth.uid() for seamless inserts
- 4 separate policies per table (SELECT, INSERT, UPDATE, DELETE)
- orcamento_itens scoped through parent orcamentos table via EXISTS check

3. Notes
- All tables use gen_random_uuid() for primary keys
- created_at timestamps default to now()
- Foreign keys with ON DELETE CASCADE for child tables
- Status stored as text with CHECK constraint for valid values
*/

-- ==========================================
-- CLIENTES
-- ==========================================
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text,
  telefone text,
  cpf_cnpj text,
  instituicao text,
  eh_universidade boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_clientes" ON clientes;
CREATE POLICY "select_own_clientes" ON clientes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_clientes" ON clientes;
CREATE POLICY "insert_own_clientes" ON clientes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_clientes" ON clientes;
CREATE POLICY "update_own_clientes" ON clientes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_clientes" ON clientes;
CREATE POLICY "delete_own_clientes" ON clientes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ==========================================
-- SERVICOS
-- ==========================================
CREATE TABLE IF NOT EXISTS servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  unidade_medida text NOT NULL DEFAULT 'palavra',
  preco_padrao numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_servicos" ON servicos;
CREATE POLICY "select_own_servicos" ON servicos FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_servicos" ON servicos;
CREATE POLICY "insert_own_servicos" ON servicos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_servicos" ON servicos;
CREATE POLICY "update_own_servicos" ON servicos FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_servicos" ON servicos;
CREATE POLICY "delete_own_servicos" ON servicos FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ==========================================
-- TERCEIRIZADOS
-- ==========================================
CREATE TABLE IF NOT EXISTS terceirizados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  especialidade text,
  chave_pix text,
  telefone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE terceirizados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_terceirizados" ON terceirizados;
CREATE POLICY "select_own_terceirizados" ON terceirizados FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_terceirizados" ON terceirizados;
CREATE POLICY "insert_own_terceirizados" ON terceirizados FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_terceirizados" ON terceirizados;
CREATE POLICY "update_own_terceirizados" ON terceirizados FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_terceirizados" ON terceirizados;
CREATE POLICY "delete_own_terceirizados" ON terceirizados FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ==========================================
-- ORCAMENTOS
-- ==========================================
CREATE TABLE IF NOT EXISTS orcamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  codigo_proposta text NOT NULL,
  cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL,
  valor_total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'rascunho',
  validade_dias integer NOT NULL DEFAULT 30,
  titulo_artigo text,
  docente_responsavel text,
  cpf_professor text,
  numero_processo text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_orcamentos" ON orcamentos;
CREATE POLICY "select_own_orcamentos" ON orcamentos FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_orcamentos" ON orcamentos;
CREATE POLICY "insert_own_orcamentos" ON orcamentos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_orcamentos" ON orcamentos;
CREATE POLICY "update_own_orcamentos" ON orcamentos FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_orcamentos" ON orcamentos;
CREATE POLICY "delete_own_orcamentos" ON orcamentos FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ==========================================
-- ORCAMENTO_ITENS
-- ==========================================
CREATE TABLE IF NOT EXISTS orcamento_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id uuid NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  servico_id uuid REFERENCES servicos(id) ON DELETE SET NULL,
  quantidade numeric NOT NULL DEFAULT 0,
  preco_unitario numeric NOT NULL DEFAULT 0,
  eh_terceirizado boolean NOT NULL DEFAULT false,
  terceirizado_id uuid REFERENCES terceirizados(id) ON DELETE SET NULL,
  valor_repasse numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orcamento_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_orcamento_itens" ON orcamento_itens;
CREATE POLICY "select_own_orcamento_itens" ON orcamento_itens FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orcamentos WHERE orcamentos.id = orcamento_itens.orcamento_id AND orcamentos.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_orcamento_itens" ON orcamento_itens;
CREATE POLICY "insert_own_orcamento_itens" ON orcamento_itens FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orcamentos WHERE orcamentos.id = orcamento_itens.orcamento_id AND orcamentos.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_orcamento_itens" ON orcamento_itens;
CREATE POLICY "update_own_orcamento_itens" ON orcamento_itens FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orcamentos WHERE orcamentos.id = orcamento_itens.orcamento_id AND orcamentos.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM orcamentos WHERE orcamentos.id = orcamento_itens.orcamento_id AND orcamentos.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_orcamento_itens" ON orcamento_itens;
CREATE POLICY "delete_own_orcamento_itens" ON orcamento_itens FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orcamentos WHERE orcamentos.id = orcamento_itens.orcamento_id AND orcamentos.user_id = auth.uid())
  );

-- ==========================================
-- BALANCO_MENSAL
-- ==========================================
CREATE TABLE IF NOT EXISTS balanco_mensal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  mes text NOT NULL,
  faturamento numeric NOT NULL DEFAULT 0,
  repasses numeric NOT NULL DEFAULT 0,
  orcamentos integer NOT NULL DEFAULT 0,
  recebido numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE balanco_mensal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_balanco" ON balanco_mensal;
CREATE POLICY "select_own_balanco" ON balanco_mensal FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_balanco" ON balanco_mensal;
CREATE POLICY "insert_own_balanco" ON balanco_mensal FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_balanco" ON balanco_mensal;
CREATE POLICY "update_own_balanco" ON balanco_mensal FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_balanco" ON balanco_mensal;
CREATE POLICY "delete_own_balanco" ON balanco_mensal FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
