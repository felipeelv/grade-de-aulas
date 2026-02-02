import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Trash2, AlertTriangle } from 'lucide-react';

interface LixeiraHorariosProps {
  isDragActive: boolean;
  className?: string;
}

export function LixeiraHorarios({ isDragActive, className = '' }: LixeiraHorariosProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'lixeira-horarios',
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        fixed bottom-6 right-6 z-50
        w-20 h-20 rounded-full
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        border-2 border-dashed
        ${className}
        ${
          isDragActive
            ? 'opacity-100 scale-110 animate-pulse'
            : 'opacity-60 scale-100'
        }
        ${
          isOver
            ? 'bg-red-500 border-red-600 text-white shadow-2xl scale-125'
            : isDragActive
            ? 'bg-red-100 border-red-400 text-red-600 shadow-xl'
            : 'bg-gray-100 border-gray-400 text-gray-500 shadow-lg'
        }
        ${
          isDragActive
            ? 'cursor-copy'
            : 'cursor-default'
        }
      `}
      title={isDragActive ? 'Solte aqui para remover o horário' : 'Lixeira - Arraste horários aqui para remover'}
    >
      <div className="relative">
        {/* Ícone da lixeira */}
        <Trash2 
          className={`
            h-8 w-8 transition-all duration-200
            ${isOver ? 'animate-bounce' : isDragActive ? 'animate-pulse' : ''}
          `} 
        />
        
        {/* Indicador de ação destrutiva quando hover */}
        {isOver && (
          <div className="absolute -top-1 -right-1">
            <AlertTriangle className="h-4 w-4 text-yellow-300 animate-pulse" />
          </div>
        )}
      </div>
      
      {/* Texto de instrução */}
      {isDragActive && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className={`
            px-3 py-1 rounded-full text-xs font-medium
            transition-all duration-200
            ${
              isOver
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-white'
            }
          `}>
            {isOver ? 'Solte para remover!' : 'Arraste aqui para remover'}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente adicional para área de lixeira expandida durante drag
export function AreaLixeiraExpandida({ isDragActive, className = '' }: LixeiraHorariosProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'lixeira-horarios-expandida',
  });

  if (!isDragActive) return null;

  return (
    <div
      ref={setNodeRef}
      className={`
        fixed bottom-0 right-0 z-40
        w-48 h-48 rounded-tl-full
        transition-all duration-300 ease-in-out
        border-4 border-dashed
        flex items-end justify-end
        pb-12 pr-12
        ${className}
        ${
          isOver
            ? 'bg-red-500/20 border-red-500 text-red-600'
            : 'bg-red-100/50 border-red-300 text-red-500'
        }
      `}
      style={{
        background: isOver 
          ? 'radial-gradient(circle at bottom right, rgba(239, 68, 68, 0.3) 0%, transparent 70%)'
          : 'radial-gradient(circle at bottom right, rgba(239, 68, 68, 0.1) 0%, transparent 70%)'
      }}
    >
      <div className="flex flex-col items-center space-y-2">
        <Trash2 className="h-12 w-12" />
        <span className="text-sm font-medium">
          {isOver ? 'Solte aqui!' : 'Zona de exclusão'}
        </span>
      </div>
    </div>
  );
}