import React, { useState, useMemo, useCallback } from 'react';
import { useSistema } from '../../context/SistemaContext';
import { FiltrosHorarios } from './FiltrosHorarios';
import { GradeHorariosMelhorada } from './GradeHorariosMelhorada';
import { GradeProfessor } from './GradeProfessor';
import { ModalAdicionarHorario } from './ModalAdicionarHorario';
import { ValidadorConflitos } from './ValidadorConflitos';
import { Edit3, Save, X, Printer, AlertTriangle, Users, Calendar, BookOpen } from 'lucide-react';

export function PaginaHorariosMelhorada() {
  const { estado } = useSistema();
  const [modoEdicao, setModoEdicao] = useState(false);
  const [turmaFiltro, setTurmaFiltro] = useState('');
  const [professorFiltro, setProfessorFiltro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [slotSelecionado, setSlotSelecionado] = useState<{
    turmaId: number;
    diaSemana: number;
    aula: number;
  } | null>(null);
  const [mostrarValidador, setMostrarValidador] = useState(false);

  // Memoizar horários filtrados para otimização
  const horariosFiltrados = useMemo(() => {
    let horarios = estado.horarios;
    
    if (turmaFiltro) {
      horarios = horarios.filter(h => h.turmaId === Number(turmaFiltro));
    }
    
    if (professorFiltro) {
      horarios = horarios.filter(h => h.professorId === Number(professorFiltro));
    }
    
    return horarios;
  }, [estado.horarios, turmaFiltro, professorFiltro]);

  // Obter entidades selecionadas
  const turmaSelecionada = useMemo(() => 
    turmaFiltro ? estado.turmas.find(t => t.id === Number(turmaFiltro)) : null,
    [turmaFiltro, estado.turmas]
  );

  const professorSelecionado = useMemo(() => 
    professorFiltro ? estado.professores.find(p => p.id === Number(professorFiltro)) : null,
    [professorFiltro, estado.professores]
  );

  // Determinar se deve mostrar grade do professor
  const mostrarGradeProfessor = professorSelecionado && !turmaFiltro;

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    const totalHorarios = estado.horarios.length;
    const totalSlots = estado.turmas.length * 30; // 30 slots por turma
    const percentualOcupacao = totalSlots > 0 ? Math.round((totalHorarios / totalSlots) * 100) : 0;
    const professoresAtivos = new Set(estado.horarios.map(h => h.professorId)).size;
    const turmasComHorarios = new Set(estado.horarios.map(h => h.turmaId)).size;
    
    return {
      totalHorarios,
      totalSlots,
      percentualOcupacao,
      professoresAtivos,
      turmasComHorarios,
      conflitos: estado.conflitos.length
    };
  }, [estado]);

  // Handlers otimizados
  const handleAdicionarHorario = useCallback((diaSemana: number, aula: number) => {
    if (!turmaSelecionada) {
      alert('Selecione uma turma para adicionar horários');
      return;
    }
    
    setSlotSelecionado({
      turmaId: turmaSelecionada.id,
      diaSemana,
      aula
    });
    setModalAberto(true);
  }, [turmaSelecionada]);

  const handleFecharModal = useCallback(() => {
    setModalAberto(false);
    setSlotSelecionado(null);
  }, []);

  const toggleModoEdicao = useCallback(() => {
    setModoEdicao(!modoEdicao);
  }, [modoEdicao]);

  const handleImprimir = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir a grade.');
      return;
    }

    const titulo = mostrarGradeProfessor
      ? `Grade de Horários - Professor ${professorSelecionado?.nome}`
      : turmaSelecionada
      ? `Grade de Horários - ${turmaSelecionada.nome}`
      : 'Grade de Horários';

    // HTML otimizado para impressão
    const htmlParaImprimir = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${titulo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { color: #666; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
            .stat-card { text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            .stat-number { font-size: 20px; font-weight: bold; color: #2563eb; }
            .stat-label { font-size: 11px; color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 8px; text-align: center; }
            th { background-color: #f5f5f5; font-weight: bold; font-size: 11px; }
            .horario-slot { min-height: 40px; font-size: 10px; padding: 4px; }
            .disciplina { font-weight: bold; margin-bottom: 2px; }
            .professor { color: #666; }
            .conflito { background-color: #fee; border: 2px solid #f87171 !important; }
            @media print {
              body { margin: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${titulo}</div>
            <div class="subtitle">Sistema de Gestão de Horários - Colégio Eleve</div>
            <div class="subtitle">Gerado em: ${new Date().toLocaleDateString('pt-BR')}</div>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-number">${estatisticas.totalHorarios}</div>
              <div class="stat-label">Aulas Cadastradas</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${estatisticas.percentualOcupacao}%</div>
              <div class="stat-label">Ocupação</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${estatisticas.professoresAtivos}</div>
              <div class="stat-label">Professores</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${estatisticas.conflitos}</div>
              <div class="stat-label">Conflitos</div>
            </div>
          </div>
          
          ${document.querySelector('.grade-impressao')?.innerHTML || '<p>Selecione uma turma para imprimir a grade.</p>'}
        </body>
      </html>
    `;

    printWindow.document.write(htmlParaImprimir);
    printWindow.document.close();
    printWindow.print();
  }, [mostrarGradeProfessor, professorSelecionado, turmaSelecionada, estatisticas]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sistema de Grade de Horários
            </h1>
            <p className="text-gray-600">
              Gerencie horários escolares com facilidade - Drag & Drop, validação em tempo real e detecção de conflitos
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Estatísticas rápidas */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1 text-blue-600">
                <Calendar className="h-4 w-4" />
                <span>{estatisticas.totalHorarios} aulas</span>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <Users className="h-4 w-4" />
                <span>{estatisticas.professoresAtivos} prof.</span>
              </div>
              {estatisticas.conflitos > 0 && (
                <div className="flex items-center space-x-1 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{estatisticas.conflitos} conflitos</span>
                </div>
              )}
            </div>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            {/* Botões de ação */}
            <div className="flex items-center space-x-2">
              {/* Botão validador de conflitos */}
              {estado.conflitos.length > 0 && (
                <button
                  onClick={() => setMostrarValidador(!mostrarValidador)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200
                    ${
                      mostrarValidador
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    }
                  `}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:block">Ver Conflitos</span>
                </button>
              )}
              
              {/* Botão de imprimir */}
              <button
                onClick={handleImprimir}
                disabled={!turmaSelecionada && !mostrarGradeProfessor}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200
                  ${
                    !turmaSelecionada && !mostrarGradeProfessor
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
                title={!turmaSelecionada && !mostrarGradeProfessor ? 'Selecione uma turma ou professor para imprimir' : 'Imprimir grade de horários'}
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:block">Imprimir</span>
              </button>
              
              {/* Botão de modo de edição */}
              <button
                onClick={toggleModoEdicao}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${
                    modoEdicao
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }
                `}
              >
                {modoEdicao ? (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Salvar Alterações</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    <span>Modo Edição</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Validador de conflitos */}
      {mostrarValidador && (
        <ValidadorConflitos 
          conflitos={estado.conflitos}
          className="animate-fadeIn"
        />
      )}

      {/* Filtros */}
      <FiltrosHorarios
        turmaFiltro={turmaFiltro}
        professorFiltro={professorFiltro}
        onTurmaChange={setTurmaFiltro}
        onProfessorChange={setProfessorFiltro}
        turmas={estado.turmas}
        professores={estado.professores}
      />

      {/* Informações da seleção atual */}
      {turmaSelecionada && !mostrarGradeProfessor && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  {turmaSelecionada.segmento} - {turmaSelecionada.ano}{turmaSelecionada.turma}
                </h3>
                <p className="text-blue-700">
                  Período: {turmaSelecionada.periodo} • {horariosFiltrados.length} aulas cadastradas
                </p>
              </div>
            </div>
            
            {modoEdicao && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-blue-300">
                <span className="text-sm font-medium text-blue-900">Modo Edição Ativo</span>
                <div className="text-xs text-blue-700 mt-1">
                  Arraste horários ou clique em "+" para adicionar
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Informações do professor selecionado */}
      {mostrarGradeProfessor && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                Visualização por Professor: {professorSelecionado?.nome}
              </h3>
              <p className="text-green-700">
                Mostrando todas as turmas onde este professor leciona • {horariosFiltrados.length} aulas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grade de Horários */}
      <div className="grade-impressao">
        {mostrarGradeProfessor ? (
          <GradeProfessor
            professor={professorSelecionado!}
            horarios={estado.horarios}
            turmas={estado.turmas}
            disciplinas={estado.disciplinas}
          />
        ) : (
          <GradeHorariosMelhorada
            horarios={horariosFiltrados}
            turmaSelecionada={turmaSelecionada}
            modoEdicao={modoEdicao}
            onAdicionarHorario={handleAdicionarHorario}
            conflitos={estado.conflitos}
          />
        )}
      </div>

      {/* Modal para adicionar horário */}
      {modalAberto && slotSelecionado && (
        <ModalAdicionarHorario
          turmaId={slotSelecionado.turmaId}
          diaSemana={slotSelecionado.diaSemana}
          aula={slotSelecionado.aula}
          onFechar={handleFecharModal}
        />
      )}
    </div>
  );
}
