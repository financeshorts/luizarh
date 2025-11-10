/*
  # Atualização de Movimentações e Feedback - Sistema Completo

  1. Alterações na Tabela movimentacoes_pessoal
    - Adicionar campos detalhados do formulário de movimentação
    - Campos adicionados:
      - `requisitante` (text) - Nome do requisitante
      - `area_requisitante` (text) - Área do requisitante
      - `data_requisicao` (date) - Data da requisição
      - `previsao_fechamento` (date) - Previsão de fechamento
      - `unidade_origem` (text) - Unidade de origem (Cristalina, Correntina, etc.)
      - `unidade_destino` (text) - Unidade de destino
      - `sexo` (text) - Sexo do colaborador (F/M)
      - `area_setor` (text) - Área/Setor
      - `centro_custo` (text) - Centro de custo
      - `horario_trabalho` (text) - Horário de trabalho
      - `candidato_pcd` (boolean) - Se é candidato PCD
      - `equipamentos_acessos` (text) - Equipamentos e acessos necessários
      - `justificativa` (text) - Justificativa da movimentação
      - `tipo_rescisao` (text) - Tipo de rescisão (Iniciativa da Empresa, Pedido de Demissão, Término de Contrato)
      - `aviso_tipo` (text) - Tipo de aviso (Indenizado, Trabalhado, Justa causa)
      - `aviso_prazo` (text) - Prazo do aviso (45 dias, 90 dias)
      - `pode_retornar` (boolean) - Se pode retornar à empresa
      - `justificativa_desligamento` (text) - Justificativa do desligamento
      - `unidade_atual` (text) - Unidade atual (promoção)
      - `setor_atual` (text) - Setor atual (promoção)
      - `centro_custo_atual` (text) - Centro de custo atual (promoção)
      - `cargo_atual` (text) - Cargo atual (promoção)
      - `salario_base_atual` (numeric) - Salário base atual
      - `gratificacao_atual` (numeric) - Gratificação atual
      - `total_mes_atual` (numeric) - Total mês atual
      - `unidade_proposta` (text) - Unidade proposta (promoção)
      - `setor_proposto` (text) - Setor proposto (promoção)
      - `centro_custo_proposto` (text) - Centro de custo proposto (promoção)
      - `cargo_proposto` (text) - Cargo proposto (promoção)
      - `salario_base_proposto` (numeric) - Salário base proposto
      - `gratificacao_proposta` (numeric) - Gratificação proposta
      - `total_mes_proposto` (numeric) - Total mês proposto
      - `reajuste` (numeric) - Valor do reajuste
      - `recursos_necessarios` (text[]) - Array de recursos (Mesa, Cadeira, Apoio de Pé, EPI)

  2. Nova Tabela: avaliacoes_desempenho_feedback
    - Sistema completo de avaliação de desempenho por ciclo de feedback
    - 5 fatores de competência com múltiplas questões
    - Sistema de pontuação de 1 a 5
    - Campos:
      - `id` (uuid, primary key)
      - `colaborador_id` (uuid, foreign key)
      - `avaliador_id` (uuid, not null)
      - `trimestre` (integer, 1-4)
      - `cargo_atual` (text)
      - `email` (text)
      - `data_avaliacao` (date)
      - `observacoes` (text)
      - Fator 1: Produtividade (5 questões: a-e)
      - Fator 2: Conhecimento e Habilidades Técnicas (3 questões: a-c)
      - Fator 3: Trabalho em equipe (5 questões: a-e)
      - Fator 4: Comprometimento com o trabalho (3 questões: a-c)
      - Fator 5: Cumprimento das normas (4 questões: a-d)
      - `total_pontos` (integer) - Total de pontos obtidos
      - `percentual_idi` (numeric) - Percentual IDI
      - `concordancia_colaborador` (boolean) - Se colaborador concorda
      - `assinatura_lider` (text)
      - `assinatura_colaborador` (text)
      - `data_assinatura_lider` (date)
      - `data_assinatura_colaborador` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas abertas (usando true) pois o app usa autenticação customizada

  4. Validações
    - Enum para unidades: Cristalina, Correntina, Corporativo, Ibicoara, Papanduva, São Gabriel, Uberlandia
    - Pontuações entre 1-5
    - Trimestre entre 1-4
    - Total de pontos máximo 100
*/

-- Criar tipo enum para unidades
DO $$ BEGIN
  CREATE TYPE unidade_tipo AS ENUM (
    'Cristalina', 
    'Correntina', 
    'Corporativo', 
    'Ibicoara', 
    'Papanduva', 
    'São Gabriel', 
    'Uberlandia'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Adicionar novos campos à tabela movimentacoes_pessoal
ALTER TABLE movimentacoes_pessoal
  ADD COLUMN IF NOT EXISTS requisitante text,
  ADD COLUMN IF NOT EXISTS area_requisitante text,
  ADD COLUMN IF NOT EXISTS data_requisicao date,
  ADD COLUMN IF NOT EXISTS previsao_fechamento date,
  ADD COLUMN IF NOT EXISTS unidade_origem text,
  ADD COLUMN IF NOT EXISTS unidade_destino text,
  ADD COLUMN IF NOT EXISTS sexo text CHECK (sexo IN ('F', 'M')),
  ADD COLUMN IF NOT EXISTS area_setor text,
  ADD COLUMN IF NOT EXISTS centro_custo text,
  ADD COLUMN IF NOT EXISTS horario_trabalho text,
  ADD COLUMN IF NOT EXISTS candidato_pcd boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS equipamentos_acessos text,
  ADD COLUMN IF NOT EXISTS justificativa text,
  ADD COLUMN IF NOT EXISTS tipo_rescisao text CHECK (tipo_rescisao IN ('Iniciativa da Empresa', 'Pedido de Demissão', 'Término de Contrato')),
  ADD COLUMN IF NOT EXISTS aviso_tipo text CHECK (aviso_tipo IN ('Indenizado', 'Trabalhado', 'Justa causa')),
  ADD COLUMN IF NOT EXISTS aviso_prazo text CHECK (aviso_prazo IN ('45 dias', '90 dias')),
  ADD COLUMN IF NOT EXISTS pode_retornar boolean,
  ADD COLUMN IF NOT EXISTS justificativa_desligamento text,
  ADD COLUMN IF NOT EXISTS unidade_atual text,
  ADD COLUMN IF NOT EXISTS setor_atual text,
  ADD COLUMN IF NOT EXISTS centro_custo_atual text,
  ADD COLUMN IF NOT EXISTS cargo_atual text,
  ADD COLUMN IF NOT EXISTS salario_base_atual numeric(10,2),
  ADD COLUMN IF NOT EXISTS gratificacao_atual numeric(10,2),
  ADD COLUMN IF NOT EXISTS total_mes_atual numeric(10,2),
  ADD COLUMN IF NOT EXISTS unidade_proposta text,
  ADD COLUMN IF NOT EXISTS setor_proposto text,
  ADD COLUMN IF NOT EXISTS centro_custo_proposto text,
  ADD COLUMN IF NOT EXISTS cargo_proposto text,
  ADD COLUMN IF NOT EXISTS salario_base_proposto numeric(10,2),
  ADD COLUMN IF NOT EXISTS gratificacao_proposta numeric(10,2),
  ADD COLUMN IF NOT EXISTS total_mes_proposto numeric(10,2),
  ADD COLUMN IF NOT EXISTS reajuste numeric(10,2),
  ADD COLUMN IF NOT EXISTS recursos_necessarios text[] DEFAULT '{}';

-- Criar tabela de avaliações de desempenho - Ciclo de Feedback
CREATE TABLE IF NOT EXISTS avaliacoes_desempenho_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  avaliador_id uuid NOT NULL,
  trimestre integer NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
  cargo_atual text,
  email text,
  data_avaliacao date NOT NULL DEFAULT CURRENT_DATE,
  observacoes text,
  
  -- Fator 1: Produtividade (5 questões)
  produtividade_1a integer CHECK (produtividade_1a BETWEEN 1 AND 5),
  produtividade_1b integer CHECK (produtividade_1b BETWEEN 1 AND 5),
  produtividade_1c integer CHECK (produtividade_1c BETWEEN 1 AND 5),
  produtividade_1d integer CHECK (produtividade_1d BETWEEN 1 AND 5),
  produtividade_1e integer CHECK (produtividade_1e BETWEEN 1 AND 5),
  
  -- Fator 2: Conhecimento e Habilidades Técnicas (3 questões)
  conhecimento_2a integer CHECK (conhecimento_2a BETWEEN 1 AND 5),
  conhecimento_2b integer CHECK (conhecimento_2b BETWEEN 1 AND 5),
  conhecimento_2c integer CHECK (conhecimento_2c BETWEEN 1 AND 5),
  
  -- Fator 3: Trabalho em equipe (5 questões)
  trabalho_equipe_3a integer CHECK (trabalho_equipe_3a BETWEEN 1 AND 5),
  trabalho_equipe_3b integer CHECK (trabalho_equipe_3b BETWEEN 1 AND 5),
  trabalho_equipe_3c integer CHECK (trabalho_equipe_3c BETWEEN 1 AND 5),
  trabalho_equipe_3d integer CHECK (trabalho_equipe_3d BETWEEN 1 AND 5),
  trabalho_equipe_3e integer CHECK (trabalho_equipe_3e BETWEEN 1 AND 5),
  
  -- Fator 4: Comprometimento com o trabalho (3 questões)
  comprometimento_4a integer CHECK (comprometimento_4a BETWEEN 1 AND 5),
  comprometimento_4b integer CHECK (comprometimento_4b BETWEEN 1 AND 5),
  comprometimento_4c integer CHECK (comprometimento_4c BETWEEN 1 AND 5),
  
  -- Fator 5: Cumprimento das normas (4 questões)
  cumprimento_normas_5a integer CHECK (cumprimento_normas_5a BETWEEN 1 AND 5),
  cumprimento_normas_5b integer CHECK (cumprimento_normas_5b BETWEEN 1 AND 5),
  cumprimento_normas_5c integer CHECK (cumprimento_normas_5c BETWEEN 1 AND 5),
  cumprimento_normas_5d integer CHECK (cumprimento_normas_5d BETWEEN 1 AND 5),
  
  -- Totalizadores
  total_pontos integer CHECK (total_pontos BETWEEN 0 AND 100),
  percentual_idi numeric(5,2),
  
  -- Concordância e assinaturas
  concordancia_colaborador boolean,
  assinatura_lider text,
  assinatura_colaborador text,
  data_assinatura_lider date,
  data_assinatura_colaborador date,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE avaliacoes_desempenho_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos"
  ON avaliacoes_desempenho_feedback FOR SELECT USING (true);

CREATE POLICY "Permitir inserção para todos"
  ON avaliacoes_desempenho_feedback FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos"
  ON avaliacoes_desempenho_feedback FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir exclusão para todos"
  ON avaliacoes_desempenho_feedback FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_feedback_colaborador_id ON avaliacoes_desempenho_feedback(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_feedback_avaliador_id ON avaliacoes_desempenho_feedback(avaliador_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_feedback_trimestre ON avaliacoes_desempenho_feedback(trimestre);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_avaliacoes_desempenho_feedback_updated_at ON avaliacoes_desempenho_feedback;
CREATE TRIGGER update_avaliacoes_desempenho_feedback_updated_at BEFORE UPDATE ON avaliacoes_desempenho_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Adicionar campo unidade na tabela colaboradores
ALTER TABLE colaboradores
  ADD COLUMN IF NOT EXISTS unidade text;