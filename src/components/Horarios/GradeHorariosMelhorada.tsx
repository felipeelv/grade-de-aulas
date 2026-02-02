import React, { useState, useCallback, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { Turma, Horario, ConflitoDados } from '../../types';
import { DIAS_SEMANA } from '../../types';
import { SlotHorarioMelhorado } from './SlotHorarioMelhorado';
import { LixeiraHorarios, AreaLixeiraExpandida } from './LixeiraHorarios';
import { ModalConfirmacaoRemocao } from './ModalConfirmacaoRemocao';
import { NotificacaoRemocao } from './NotificacaoRemocao';
import { useSistema } from '../../context/SistemaContext';

interface GradeHorariosMelhoradaProps {
  horarios: Horario[];
  turmaSelecionada: Turma | null;
  modoEdicao: boolean;
  onAdicionarHorario: (diaSemana: number, aula: number) => void;
  conflitos: ConflitoDados[];
}

const AULAS = [1, 2, 3, 4, 5, 6] as const;
const DIAS = [1, 2, 3, 4, 5] as const;

export function GradeHorariosMelhorada({
  horarios,
  turmaSelecionada,
  modoEdicao,
  onAdicionarHorario,
  conflitos
}: GradeHorariosMelhoradaProps) {
  const { moverHorario, removerHorario, obterDisciplinaPorId, obterProfessorPorId } = useSistema();
  const [horarioArrastado, setHorarioArrastado] = useState<Horario | null>(null);
  const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);
  const [horarioParaRemover, setHorarioParaRemover] = useState<Horario | null>(null);
  const [mostrarNotificacao, setMostrarNotificacao] = useState(false);
  const [nomeHorarioRemovido, setNomeHorarioRemovido] = useState('');
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  // Se não há turma selecionada, mostrar mensagem amigável
  if (!turmaSelecionada) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 8h.01M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V9a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Selecione uma turma
          </h3>
          <p className="text-gray-600 mb-6">
            Escolha uma turma nos filtros acima para visualizar e editar sua grade de horários. 
            Você poderá arrastar e soltar horários, adicionar novos e visualizar conflitos.
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Dica:</strong> Use os filtros para ver grades específicas ou 
              selecione um professor para ver todas as suas aulas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Memoizar horários da turma para otimização
  const horariosDoTurma = useMemo(() => 
    horarios.filter(h => h.turmaId === turmaSelecionada.id),
    [horarios, turmaSelecionada.id]
  );

  // Função otimizada para obter horário de um slot específico
  const obterHorarioDoSlot = useCallback((dia: number, aula: number): Horario | undefined => {
    return horariosDoTurma.find(h => h.diaSemana === dia && h.aula === aula);
  }, [horariosDoTurma]);

  // Função para verificar se um slot tem conflito
  const slotTemConflito = useCallback((dia: number, aula: number): ConflitoDados | undefined => {
    const horarioDoSlot = obterHorarioDoSlot(dia, aula);
    if (!horarioDoSlot) return undefined;
    
    return conflitos.find(conflito => 
      conflito.horarios.some(h => h.id === horarioDoSlot.id)
    );
  }, [obterHorarioDoSlot, conflitos]);

  // Handler para início do drag
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const horarioId = Number(event.active.id);
    const horario = horariosDoTurma.find(h => h.id === horarioId);
    setHorarioArrastado(horario || null);
  }, [horariosDoTurma]);

  // Handler para drag over
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setDragOverSlot(over?.id?.toString() || null);
  }, []);

  // Handler para fim do drag
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setHorarioArrastado(null);
    setDragOverSlot(null);
    
    const { active, over } = event;
    
    if (!over || !active) return;
    
    const horarioId = Number(active.id);
    const horario = horariosDoTurma.find(h => h.id === horarioId);
    
    if (!horario) return;
    
    // Verificar se foi solto na lixeira
    if (over.id === 'lixeira-horarios' || over.id === 'lixeira-horarios-expandida') {
      setHorarioParaRemover(horario);
      setMostrarModalConfirmacao(true);
      return;
    }
    
    // Verificar se foi solto em um slot válido
    const overIdStr = over.id.toString();
    const [novoDiaStr, novaAulaStr] = overIdStr.split('-');
    const novoDia = parseInt(novoDiaStr);
    const novaAula = parseInt(novaAulaStr);
    
    if (isNaN(novoDia) || isNaN(novaAula)) return;
    
    // Verificar se o slot está ocupado
    const horarioNoSlot = obterHorarioDoSlot(novoDia, novaAula);
    if (horarioNoSlot && horarioNoSlot.id !== horario.id) {
      alert('Este horário já está ocupado. Escolha um slot vazio.');
      return;
    }
    
    // Se é o mesmo slot, não faz nada
    if (horario.diaSemana === novoDia && horario.aula === novaAula) {
      return;
    }
    
    try {
      await moverHorario(horario.id, novoDia, novaAula);
    } catch (error) {
      console.error('Erro ao mover horário:', error);
      alert('Erro ao mover horário. Tente novamente.');
    }
  }, [horariosDoTurma, obterHorarioDoSlot, moverHorario]);

  // Handler para confirmar remoção
  const handleConfirmarRemocao = useCallback(async () => {
    if (!horarioParaRemover) return;
    
    try {
      const disciplina = obterDisciplinaPorId(horarioParaRemover.disciplinaId);
      const professor = obterProfessorPorId(horarioParaRemover.professorId);
      
      await removerHorario(horarioParaRemover.id);
      
      setNomeHorarioRemovido(`${disciplina?.nome || 'Disciplina'} - ${professor?.nome || 'Professor'}`);
      setMostrarNotificacao(true);
      
      setTimeout(() => setMostrarNotificacao(false), 3000);
    } catch (error) {
      console.error('Erro ao remover horário:', error);
      alert('Erro ao remover horário. Tente novamente.');
    } finally {
      setMostrarModalConfirmacao(false);
      setHorarioParaRemover(null);
    }
  }, [horarioParaRemover, obterDisciplinaPorId, obterProfessorPorId, removerHorario]);

  // Verificar se slot está sendo destacado durante drag
  const isSlotHighlighted = useCallback((dia: number, aula: number) => {
    if (!horarioArrastado) return false;
    const slotId = `${dia}-${aula}`;
    return dragOverSlot === slotId;
  }, [horarioArrastado, dragOverSlot]);

  return (
    <div className="space-y-6">
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Cabeçalho da grade */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Grade de Horários - {turmaSelecionada.segmento} {turmaSelecionada.ano}{turmaSelecionada.turma}
              </h3>
              <p className="text-sm text-gray-600">
                Período: {turmaSelecionada.periodo} • {horariosDoTurma.length} aulas cadastradas
              </p>
            </div>
            
            {modoEdicao && (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                  <span className="font-medium">Modo Edição Ativo</span>
                  <div className="text-xs mt-1">Arraste horários ou clique em "+" para adicionar</div>
                </div>
                <LixeiraHorarios isDragActive={!!horarioArrastado} />
              </div>
            )}
          </div>

          {/* Estatísticas da grade */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{horariosDoTurma.length}</div>
              <div className="text-xs text-gray-600">Aulas cadastradas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{30 - horariosDoTurma.length}</div>
              <div className="text-xs text-gray-600">Slots livres</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(horariosDoTurma.map(h => h.professorId)).size}
              </div>
              <div className="text-xs text-gray-600">Professores</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${conflitos.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {conflitos.length}
              </div>
              <div className="text-xs text-gray-600">Conflitos</div>
            </div>
          </div>
        </div>

        {/* Grade de horários */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Cabeçalho da tabela */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aula
                  </th>
                  {DIAS.map((dia) => (
                    <th key={dia} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {DIAS_SEMANA[dia]}
                    </th>
                  ))}
                </tr>
              </thead>
              
              {/* Corpo da tabela */}
              <tbody className="bg-white divide-y divide-gray-200">
                {AULAS.map((aula) => (
                  <tr key={aula} className="hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                      <div className="text-center">
                        <div className="font-bold">{aula}ª</div>
                        <div className="text-xs text-gray-500">
                          {aula === 1 && '07:00'}
                          {aula === 2 && '07:50'}
                          {aula === 3 && '08:40'}
                          {aula === 4 && '09:50'}
                          {aula === 5 && '10:40'}
                          {aula === 6 && '11:30'}
                        </div>
                      </div>
                    </td>
                    {DIAS.map((dia) => {
                      const horario = obterHorarioDoSlot(dia, aula);
                      const conflito = slotTemConflito(dia, aula);
                      const highlighted = isSlotHighlighted(dia, aula);
                      
                      return (
                        <td 
                          key={`${dia}-${aula}`} 
                          className={`p-2 transition-all duration-200 ${
                            highlighted ? 'bg-blue-50' : ''
                          }`}
                        >
                          <SlotHorarioMelhorado
                            dia={dia}
                            aula={aula}
                            horario={horario}
                            conflito={conflito}
                            modoEdicao={modoEdicao}
                            onAdicionarHorario={() => onAdicionarHorario(dia, aula)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lixeira expandida durante drag */}
        {horarioArrastado && <AreaLixeiraExpandida isDragActive={true} />}

        {/* Overlay de drag */}
        <DragOverlay>
          {horarioArrastado && (
            <div 
              style={{ backgroundColor: obterDisciplinaPorId(horarioArrastado.disciplinaId)?.cor || '#6B7280' }}
              className="min-h-[80px] p-3 text-white rounded-lg shadow-2xl border-2 border-white/20 transform rotate-3 scale-105"
            >
              <div className="font-semibold text-sm">
                {obterDisciplinaPorId(horarioArrastado.disciplinaId)?.nome || 'Disciplina'}
              </div>
              <div className="text-xs opacity-90">
                {obterProfessorPorId(horarioArrastado.professorId)?.nome || 'Professor'}
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Modal de confirmação de remoção */}
      {mostrarModalConfirmacao && horarioParaRemover && (
        <ModalConfirmacaoRemocao
          horario={horarioParaRemover}
          onConfirmar={handleConfirmarRemocao}
          onCancelar={() => {
            setMostrarModalConfirmacao(false);
            setHorarioParaRemover(null);
          }}
        />
      )}

      {/* Notificação de remoção */}
      {mostrarNotificacao && (
        <NotificacaoRemocao
          nomeHorario={nomeHorarioRemovido}
          onFechar={() => setMostrarNotificacao(false)}
        />
      )}
    </div>
  );
}
