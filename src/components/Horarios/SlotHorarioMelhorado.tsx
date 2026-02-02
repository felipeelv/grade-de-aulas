import React, { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Horario, ConflitoDados } from '../../types';
import { useSistema } from '../../context/SistemaContext';
import { Plus, X, AlertTriangle, Clock, User, BookOpen } from 'lucide-react';

interface SlotHorarioMelhoradoProps {
  dia: number;
  aula: number;
  horario?: Horario;
  conflito?: ConflitoDados;
  modoEdicao: boolean;
  onAdicionarHorario: () => void;
}

export function SlotHorarioMelhorado({
  dia,
  aula,
  horario,
  conflito,
  modoEdicao,
  onAdicionarHorario
}: SlotHorarioMelhoradoProps) {
  const { removerHorario, obterDisciplinaPorId, obterProfessorPorId } = useSistema();
  const [isHovering, setIsHovering] = useState(false);

  // Setup do droppable (para receber drops)
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `${dia}-${aula}`,
  });

  // Setup do draggable (se há horário)
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: horario?.id.toString() || '',
    disabled: !horario || !modoEdicao,
    data: {
      horario,
      tipo: 'horario'
    }
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 1000 : 'auto',
      }
    : undefined;

  // Se não há horário, mostrar slot vazio
  if (!horario) {
    return (
      <div
        ref={setDropRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`
          relative min-h-[80px] border border-gray-200 p-3
          flex items-center justify-center transition-all duration-300
          ${
            isOver
              ? 'bg-blue-100 border-blue-400 border-dashed border-2 shadow-lg scale-105'
              : isHovering && modoEdicao
              ? 'bg-gray-100 border-gray-300 shadow-md'
              : 'bg-gray-50/50 hover:bg-gray-100/50'
          }
          ${modoEdicao ? 'cursor-pointer' : ''}
          rounded-lg
        `}
      >
        {modoEdicao && (
          <div className="text-center">
            <button
              onClick={onAdicionarHorario}
              className={`
                flex items-center justify-center w-10 h-10 rounded-full 
                transition-all duration-200 group
                ${
                  isHovering || isOver
                    ? 'bg-blue-100 text-blue-600 shadow-md scale-110'
                    : 'bg-gray-200 text-gray-500 hover:bg-blue-50 hover:text-blue-500'
                }
              `}
              title="Adicionar horário"
            >
              <Plus className={`h-5 w-5 transition-transform duration-200 ${
                isHovering || isOver ? 'scale-110' : ''
              }`} />
            </button>
            {(isHovering || isOver) && (
              <div className="text-xs text-gray-600 mt-2 font-medium">
                Clique para adicionar
              </div>
            )}
          </div>
        )}
        
        {!modoEdicao && (
          <div className="text-center text-gray-400">
            <Clock className="h-6 w-6 mx-auto mb-1 opacity-50" />
            <div className="text-xs">Livre</div>
          </div>
        )}
      </div>
    );
  }

  // Obter dados da disciplina e professor
  const disciplina = obterDisciplinaPorId(horario.disciplinaId);
  const professor = obterProfessorPorId(horario.professorId);

  const handleRemover = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja remover a aula de ${disciplina?.nome || 'Disciplina'} com ${professor?.nome || 'Professor'}?`)) {
      removerHorario(horario.id);
    }
  };

  // Determinar estilo baseado no estado
  const getSlotStyle = () => {
    if (isDragging) {
      return 'opacity-50 shadow-2xl scale-105 rotate-2';
    }
    if (conflito) {
      return 'border-red-500 border-2 shadow-lg animate-pulse';
    }
    if (isOver && modoEdicao) {
      return 'border-blue-400 border-2 shadow-lg scale-105';
    }
    if (isHovering && modoEdicao) {
      return 'border-gray-400 shadow-md scale-102';
    }
    return 'border-gray-200 hover:shadow-sm';
  };

  return (
    <div
      ref={(node) => {
        setDropRef(node);
        setDragRef(node);
      }}
      style={{
        ...style,
        backgroundColor: disciplina?.cor || '#6B7280'
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`
        relative min-h-[80px] p-3 text-white rounded-lg
        transition-all duration-200 cursor-pointer
        ${getSlotStyle()}
        ${modoEdicao && !isDragging ? 'hover:shadow-lg' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      {/* Indicador de conflito */}
      {conflito && (
        <div className="absolute -top-1 -right-1 z-10">
          <div 
            className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce"
            title={`Conflito: ${conflito.descricao}`}
          >
            <AlertTriangle className="h-3 w-3 text-white" />
          </div>
        </div>
      )}

      {/* Botão remover (modo edição) */}
      {modoEdicao && !isDragging && (
        <button
          onClick={handleRemover}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors duration-200 z-20 shadow-md"
          title="Remover horário"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Conteúdo do slot */}
      <div className="space-y-2">
        {/* Nome da disciplina */}
        <div className="font-semibold text-sm leading-tight">
          <BookOpen className="h-3 w-3 inline mr-1" />
          {disciplina?.nome || 'Disciplina'}
        </div>
        
        {/* Nome do professor */}
        <div className="text-xs opacity-90 leading-tight">
          <User className="h-3 w-3 inline mr-1" />
          {professor?.nome || 'Professor'}
        </div>

        {/* Informações adicionais no hover */}
        {isHovering && !isDragging && (
          <div className="text-xs opacity-75 border-t border-white/20 pt-1 mt-2">
            <div>Dia: {['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'][dia]}</div>
            <div>Aula: {aula}ª</div>
          </div>
        )}
      </div>

      {/* Indicador de drag (modo edição) */}
      {modoEdicao && !isDragging && (
        <div className="absolute bottom-1 right-1 text-white/60">
          <div className="flex space-x-0.5">
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
          </div>
        </div>
      )}

      {/* Overlay de dragging */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <div className="text-white font-medium text-sm">
            Movendo...
          </div>
        </div>
      )}
    </div>
  );
}
