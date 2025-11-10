import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { ColaboradoresSection } from './sections/ColaboradoresSection'
import { AvaliarSection } from './sections/AvaliarSection'
import { FeedbacksSection } from './sections/FeedbacksSection'
import { AvaliacaoExperienciaSection } from './sections/AvaliacaoExperienciaSection'
import { AvaliacaoFeedbackSection } from './sections/AvaliacaoFeedbackSection'
import { MovimentacaoRequisicaoSection } from './sections/MovimentacaoRequisicaoSection'
import { useSystemSettings } from '../hooks/useSystemSettings'
import { User } from '../types'

interface GestorFlowProps {
  user: User
  onLogout: () => void
}

export function GestorFlow({ user, onLogout }: GestorFlowProps) {
  const [activeTab, setActiveTab] = useState<'colaboradores' | 'avaliar' | 'feedbacks' | 'avaliacao-experiencia' | 'avaliacao-feedback' | 'movimentacao-requisicao'>('colaboradores')
  const { settings } = useSystemSettings()

  const handleAvaliarColaborador = (colaboradorId: string) => {
    setActiveTab('avaliar')
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md p-1.5">
              <img
                src={settings.logo_url}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Painel do Gestor
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Bem-vindo(a), {user.nome} • Gerencie seus colaboradores
              </p>
            </div>
          </div>
          
          <div className="ml-auto">
            <button
              onClick={onLogout}
              className="flex items-center text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-1" />
              Sair
            </button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('colaboradores')}
            className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              activeTab === 'colaboradores'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 Colaboradores
          </button>
          <button
            onClick={() => setActiveTab('avaliar')}
            className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              activeTab === 'avaliar'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📝 Avaliar
          </button>
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              activeTab === 'feedbacks'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💬 Feedbacks
          </button>
          <button
            onClick={() => setActiveTab('avaliacao-experiencia')}
            className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              activeTab === 'avaliacao-experiencia'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎓 Experiência
          </button>
          <button
            onClick={() => setActiveTab('avaliacao-feedback')}
            className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              activeTab === 'avaliacao-feedback'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Desempenho
          </button>
          <button
            onClick={() => setActiveTab('movimentacao-requisicao')}
            className={`flex-1 min-w-[140px] px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              activeTab === 'movimentacao-requisicao'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔄 Movimentação
          </button>
        </div>

        {/* Content based on active tab */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'colaboradores' && (
            <ColaboradoresSection
              isRH={false}
              gestorId={user.id}
              gestorName={user.nome}
              onAvaliar={handleAvaliarColaborador}
            />
          )}
          {activeTab === 'avaliar' && (
            <AvaliarSection
              gestorId={user.id}
              gestorNome={user.nome}
            />
          )}
          {activeTab === 'feedbacks' && (
            <FeedbacksSection
              gestorId={user.id}
              gestorNome={user.nome}
            />
          )}
          {activeTab === 'avaliacao-experiencia' && (
            <AvaliacaoExperienciaSection />
          )}
          {activeTab === 'avaliacao-feedback' && (
            <AvaliacaoFeedbackSection />
          )}
          {activeTab === 'movimentacao-requisicao' && (
            <MovimentacaoRequisicaoSection />
          )}
        </motion.div>
      </div>
    </div>
  )
}