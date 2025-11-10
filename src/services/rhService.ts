import { supabase } from '../lib/supabase'
import { 
  Colaborador, 
  Avaliacao, 
  Feedback, 
  MovimentacaoPessoal, 
  Cargo, 
  DashboardMetrics,
  ColaboradorForm,
  AvaliacaoForm,
  FeedbackForm
} from '../types'
import { logger } from '../lib/logger'

export class RHService {
  // ==================== COLABORADORES ====================
  
  async getColaboradores(gestorId?: string): Promise<Colaborador[]> {
    try {
      let query = supabase
        .from('colaboradores')
        .select('*')
        .order('nome')

      if (gestorId) {
        query = query.eq('gestor_id', gestorId)
      }

      const { data, error } = await query

      if (error) {
        logger.error('Erro ao buscar colaboradores:', error)
        throw error
      }

      return data || []
    } catch (error) {
      logger.error('Erro no serviço getColaboradores:', error)
      return []
    }
  }

  async createColaborador(colaboradorData: ColaboradorForm, gestorId: string | null): Promise<Colaborador> {
    try {
      const insertData: any = {
        nome: colaboradorData.nome,
        email: colaboradorData.email || null,
        setor: colaboradorData.setor,
        unidade: colaboradorData.unidade || null,
        data_admissao: colaboradorData.data_admissao,
        status: colaboradorData.status || 'ativo',
        gestor_id: gestorId || null
      }

      logger.info('Inserting colaborador data:', insertData)

      const { data, error } = await supabase
        .from('colaboradores')
        .insert(insertData)
        .select('*')
        .single()

      if (error) {
        logger.error('Erro ao criar colaborador:', error)
        logger.error('Detalhes:', error.message, error.details, error.hint, error.code)
        throw error
      }

      logger.success('Colaborador criado com sucesso:', data)
      return data
    } catch (error) {
      logger.error('Erro no serviço createColaborador:', error)
      throw error
    }
  }

  async updateColaborador(id: string, colaboradorData: ColaboradorForm): Promise<Colaborador> {
    try {
      logger.info('Atualizando colaborador:', id, colaboradorData)

      const { data, error } = await supabase
        .from('colaboradores')
        .update({
          nome: colaboradorData.nome,
          email: colaboradorData.email,
          setor: colaboradorData.setor,
          data_admissao: colaboradorData.data_admissao,
          status: colaboradorData.status,
          foto_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        logger.error('Erro ao atualizar colaborador:', error)
        logger.error('Detalhes:', error.message, error.details, error.hint, error.code)
        throw error
      }

      logger.success('Colaborador atualizado com sucesso:', data)
      return data
    } catch (error) {
      logger.error('Erro no serviço updateColaborador:', error)
      throw error
    }
  }

  async deleteColaborador(id: string): Promise<void> {
    try {
      // Primeiro, excluir avaliações relacionadas
      const { error: avaliacoesError } = await supabase
        .from('avaliacoes_experiencia')
        .delete()
        .eq('colaborador_id', id)

      if (avaliacoesError) {
        logger.error('Erro ao excluir avaliações:', avaliacoesError)
      }

      // Excluir feedbacks relacionados
      const { error: feedbacksError } = await supabase
        .from('feedbacks')
        .delete()
        .eq('colaborador_id', id)

      if (feedbacksError) {
        logger.error('Erro ao excluir feedbacks:', feedbacksError)
      }

      // Depois, excluir o colaborador
      const { error } = await supabase
        .from('colaboradores')
        .delete()
        .eq('id', id)

      if (error) {
        logger.error('Erro ao excluir colaborador:', error)
        throw error
      }

      logger.success('Colaborador excluído com sucesso:', id)
    } catch (error) {
      logger.error('Erro no serviço deleteColaborador:', error)
      throw error
    }
  }

  // ==================== AVALIAÇÕES ====================

  async getAvaliacoes(gestorId?: string): Promise<Avaliacao[]> {
    try {
      let query = supabase
        .from('avaliacoes_desempenho')
        .select(`
          *,
          colaborador:colaboradores!avaliacoes_desempenho_colaborador_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (gestorId) {
        query = query.eq('avaliador_id', gestorId)
      }

      const { data, error } = await query

      if (error) {
        logger.error('Erro ao buscar avaliações:', error)
        throw error
      }

      return data || []
    } catch (error) {
      logger.error('Erro no serviço getAvaliacoes:', error)
      return []
    }
  }

  async createAvaliacao(avaliacaoData: AvaliacaoForm, avaliadorId: string): Promise<Avaliacao> {
    try {
      const insertData = {
        colaborador_id: avaliacaoData.colaborador_id,
        avaliador_id: avaliadorId,
        trabalho_equipe: avaliacaoData.trabalho_equipe,
        comunicacao: avaliacaoData.comunicacao,
        responsabilidade: avaliacaoData.responsabilidade,
        pontualidade: avaliacaoData.pontualidade,
        proatividade: avaliacaoData.proatividade,
        qualidade_trabalho: avaliacaoData.qualidade_trabalho,
        comentarios: avaliacaoData.comentarios || null,
        plano_acao: avaliacaoData.plano_acao || null,
        data_avaliacao: new Date().toISOString().split('T')[0]
      }

      logger.info('Inserindo avaliação:', insertData)

      const { data, error } = await supabase
        .from('avaliacoes_desempenho')
        .insert(insertData)
        .select(`
          *,
          colaborador:colaboradores!avaliacoes_desempenho_colaborador_id_fkey(*)
        `)
        .single()

      if (error) {
        logger.error('Erro ao criar avaliação:', error)
        logger.error('Detalhes completos do erro:', JSON.stringify(error, null, 2))
        throw error
      }

      logger.success('Avaliação criada com sucesso:', data)
      return data
    } catch (error) {
      logger.error('Erro no serviço createAvaliacao:', error)
      throw error
    }
  }

  // ==================== FEEDBACKS ====================

  async createFeedback(feedbackData: FeedbackForm, gestorId: string): Promise<Feedback> {
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .insert({
          colaborador_id: feedbackData.colaborador_id,
          gestor_id: gestorId,
          pauta: feedbackData.pauta,
          posicionamento_colaborador: feedbackData.posicionamento_colaborador,
          observacoes: feedbackData.observacoes,
          plano_acao: feedbackData.plano_acao
        })
        .select(`
          *,
          colaborador:colaboradores(*),
          gestor:colaboradores!feedbacks_gestor_id_fkey(*)
        `)
        .single()

      if (error) {
        logger.error('Erro ao criar feedback:', error)
        throw error
      }

      logger.success('Feedback criado com sucesso:', data)
      return data
    } catch (error) {
      logger.error('Erro no serviço createFeedback:', error)
      throw error
    }
  }

  async getFeedbacks(gestorId?: string): Promise<Feedback[]> {
    try {
      let query = supabase
        .from('feedbacks')
        .select(`
          *,
          colaborador:colaboradores!feedbacks_colaborador_id_fkey(*),
          gestor:colaboradores!feedbacks_gestor_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (gestorId) {
        query = query.eq('gestor_id', gestorId)
      }

      const { data, error } = await query

      if (error) {
        logger.error('Erro ao buscar feedbacks:', error)
        throw error
      }

      return data || []
    } catch (error) {
      logger.error('Erro no serviço getFeedbacks:', error)
      return []
    }
  }

  // ==================== DASHBOARD ====================

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Usar a view dashboard_metricas se existir, senão calcular manualmente
      const { data: viewData, error: viewError } = await supabase
        .from('dashboard_metricas')
        .select('*')
        .single()

      if (!viewError && viewData) {
        return {
          total_colaboradores: viewData.total_colaboradores || 0,
          colaboradores_experiencia: viewData.colaboradores_experiencia || 0,
          media_geral_mes: viewData.media_geral_mes || 0,
          taxa_retencao_12m: viewData.taxa_retencao_12m || 0,
          acima_expectativa: viewData.acima_expectativa || 0,
          dentro_expectativa: viewData.dentro_expectativa || 0,
          abaixo_expectativa: viewData.abaixo_expectativa || 0
        }
      }

      // Fallback: calcular métricas manualmente
      const { data: colaboradores } = await supabase
        .from('colaboradores')
        .select('*')

      const { data: avaliacoesAnteriores } = await supabase
        .from('avaliacoes_experiencia')
        .select('*')
        .not('media_geral', 'is', null)

      const { data: avaliacoesExperiencia } = await supabase
        .from('avaliacoes_experiencia')
        .select('nota_final')
        .not('nota_final', 'is', null)

      const { data: avaliacoesFeedback } = await supabase
        .from('avaliacoes_desempenho_feedback')
        .select('percentual_idi')
        .not('percentual_idi', 'is', null)

      const totalColaboradores = colaboradores?.length || 0
      const colaboradoresExperiencia = colaboradores?.filter(c => c.status === 'experiencia').length || 0
      const colaboradoresAtivos = colaboradores?.filter(c => c.status === 'ativo').length || 0

      const mediaAvaliacoesExperiencia = avaliacoesExperiencia?.length > 0
        ? avaliacoesExperiencia.reduce((acc, a) => acc + (a.nota_final || 0), 0) / avaliacoesExperiencia.length
        : 0

      const mediaAvaliacoesFeedback = avaliacoesFeedback?.length > 0
        ? avaliacoesFeedback.reduce((acc, a) => acc + (a.percentual_idi || 0), 0) / (avaliacoesFeedback.length * 10)
        : 0

      const mediaGeralMes = (mediaAvaliacoesExperiencia + mediaAvaliacoesFeedback) / (avaliacoesExperiencia?.length || 0 + avaliacoesFeedback?.length || 0) || 0

      const taxaRetencao12m = totalColaboradores > 0 ? (colaboradoresAtivos / totalColaboradores) * 100 : 0

      const todasAvaliacoesExp = avaliacoesExperiencia?.map(a => a.nota_final || 0) || []
      const todasAvaliacoesFb = avaliacoesFeedback?.map(a => (a.percentual_idi || 0) / 10) || []
      const todasNotas = [...todasAvaliacoesExp, ...todasAvaliacoesFb]

      const acimaExpectativa = todasNotas.filter(n => n >= 9.0).length
      const dentroExpectativa = todasNotas.filter(n => n >= 7.0 && n < 9.0).length
      const abaixoExpectativa = todasNotas.filter(n => n < 7.0).length

      const { data: requisicoes } = await supabase
        .from('movimentacao_requisicao_pessoal')
        .select('status')

      const requisicoesPendentes = requisicoes?.filter(r => r.status === 'pendente').length || 0

      const metrics: DashboardMetrics = {
        total_colaboradores: totalColaboradores,
        colaboradores_experiencia: colaboradoresExperiencia,
        media_geral_mes: mediaGeralMes,
        taxa_retencao_12m: taxaRetencao12m,
        acima_expectativa: acimaExpectativa,
        dentro_expectativa: dentroExpectativa,
        abaixo_expectativa: abaixoExpectativa,
        avaliacoes_experiencia: avaliacoesExperiencia?.length || 0,
        avaliacoes_desempenho: avaliacoesFeedback?.length || 0,
        requisicoes_pendentes: requisicoesPendentes
      }

      logger.success('Métricas do dashboard carregadas:', metrics)
      return metrics
    } catch (error) {
      logger.error('Erro ao carregar métricas do dashboard:', error)
      throw error
    }
  }

  // ==================== MOVIMENTAÇÕES ====================

  async createMovimentacao(movimentacaoData: any): Promise<MovimentacaoPessoal> {
    try {
      const { data, error } = await supabase
        .from('movimentacao_pessoal')
        .insert({
          colaborador_id: movimentacaoData.colaborador_id,
          tipo_movimentacao: movimentacaoData.tipo_movimentacao,
          cargo_anterior_id: movimentacaoData.cargo_anterior_id,
          cargo_novo_id: movimentacaoData.cargo_novo_id,
          setor_anterior: movimentacaoData.setor_anterior,
          setor_novo: movimentacaoData.setor_novo,
          data_movimentacao: movimentacaoData.data_movimentacao || new Date().toISOString().split('T')[0],
          motivo: movimentacaoData.motivo,
          observacoes: movimentacaoData.observacoes
        })
        .select(`
          *,
          colaborador:colaboradores(*)
        `)
        .single()

      if (error) {
        logger.error('Erro ao criar movimentação:', error)
        throw error
      }

      logger.success('Movimentação criada com sucesso:', data)
      return data
    } catch (error) {
      logger.error('Erro no serviço createMovimentacao:', error)
      throw error
    }
  }

  async getMovimentacoes(): Promise<MovimentacaoPessoal[]> {
    try {
      const { data, error } = await supabase
        .from('movimentacao_pessoal')
        .select(`
          *,
          colaborador:colaboradores(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Erro ao buscar movimentações:', error)
        throw error
      }

      return data || []
    } catch (error) {
      logger.error('Erro no serviço getMovimentacoes:', error)
      return []
    }
  }

  // ==================== CARGOS ====================

  async createCargo(cargoData: any): Promise<Cargo> {
    try {
      const { data, error } = await supabase
        .from('cargos')
        .insert({
          codigo: cargoData.codigo || `CARGO_${Date.now()}`,
          nome: cargoData.nome,
          descricao: cargoData.descricao,
          competencias_tecnicas: cargoData.competencias_tecnicas || [],
          competencias_comportamentais: cargoData.competencias_comportamentais || [],
          salario_base: cargoData.salario_base
        })
        .select()
        .single()

      if (error) {
        logger.error('Erro ao criar cargo:', error)
        throw error
      }

      logger.success('Cargo criado com sucesso:', data)
      return data
    } catch (error) {
      logger.error('Erro no serviço createCargo:', error)
      throw error
    }
  }

  async getCargos(): Promise<Cargo[]> {
    try {
      const { data, error } = await supabase
        .from('cargos')
        .select('*')
        .order('nome')

      if (error) {
        logger.error('Erro ao buscar cargos:', error)
        throw error
      }

      return data || []
    } catch (error) {
      logger.error('Erro no serviço getCargos:', error)
      return []
    }
  }
}

export const rhService = new RHService()