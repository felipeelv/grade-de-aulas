import React, { useState, useCallback } from 'react';
import { Navegacao } from './Navegacao';
import { Dashboard } from '../Dashboard/Dashboard';
import { PaginaHorariosMelhorada } from '../Horarios/PaginaHorariosMelhorada';
import { PaginaProfessores } from '../Professores/PaginaProfessores';
import { PaginaTurmas } from '../Turmas/PaginaTurmas';
import { PaginaDisciplinas } from '../Disciplinas/PaginaDisciplinas';

export function LayoutMelhorado() {
  const [abaSelecionada, setAbaSelecionada] = useState('dashboard');
  const [carregandoAba, setCarregandoAba] = useState(false);

  const handleMudarAba = useCallback(async (novaAba: string) => {
    if (novaAba === abaSelecionada) return;
    
    setCarregandoAba(true);
    
    // Simular pequeno delay para transição suave
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setAbaSelecionada(novaAba);
    setCarregandoAba(false);
  }, [abaSelecionada]);

  const renderizarConteudo = () => {
    if (carregandoAba) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    try {
      switch (abaSelecionada) {
        case 'dashboard':
          return <Dashboard />;
        case 'horarios':
          return <PaginaHorariosMelhorada />;
        case 'professores':
          return <PaginaProfessores />;
        case 'turmas':
          return <PaginaTurmas />;
        case 'disciplinas':
          return <PaginaDisciplinas />;
        default:
          return <Dashboard />;
      }
    } catch (error) {
      console.error('Erro ao renderizar aba:', error);
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Erro ao carregar página
            </h3>
            <p className="text-red-700 mb-4">
              Ocorreu um erro ao carregar o conteúdo desta página.
            </p>
            <button
              onClick={() => setAbaSelecionada('dashboard')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navegacao 
        abaSelecionada={abaSelecionada} 
        aoSelecionarAba={handleMudarAba} 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderizarConteudo()}
      </main>
    </div>
  );
}
