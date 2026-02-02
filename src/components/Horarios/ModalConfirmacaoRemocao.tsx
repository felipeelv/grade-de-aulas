import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Horario } from '../../types';
import { useSistema } from '../../context/SistemaContext';

interface ModalConfirmacaoRemocaoProps {
  horario: Horario;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ModalConfirmacaoRemocao({ horario, onConfirmar, onCancelar }: ModalConfirmacaoRemocaoProps) {
  const { obterDisciplinaPorId, obterProfessorPorId, obterTurmaPorId } = useSistema();
  
  const disciplina = obterDisciplinaPorId(horario.disciplinaId);
  const professor = obterProfessorPorId(horario.professorId);
  const turma = obterTurmaPorId(horario.turmaId);
  
  const DIAS_SEMANA = {
    1: 'Segunda-feira',
    2: 'Terça-feira', 
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl animate-in fade-in duration-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Remover Horário
            </h3>
            <p className="text-sm text-gray-600">
              Esta ação não pode ser desfeita
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: disciplina?.cor }}
              />
              <div>
                <p className="font-medium text-gray-900">
                  {disciplina?.nome}
                </p>
                <p className="text-sm text-gray-600">
                  {professor?.nome}
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Turma:</span>
                  <p className="text-gray-900">
                    {turma?.segmento} - {turma?.ano}{turma?.turma}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Horário:</span>
                  <p className="text-gray-900">
                    {DIAS_SEMANA[horario.diaSemana as keyof typeof DIAS_SEMANA]}
                  </p>
                  <p className="text-gray-900">
                    Aula {horario.aula}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Atenção!</p>
              <p>Este horário será removido permanentemente da grade. O professor ficará disponível neste período.</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onCancelar}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Remover Horário</span>
          </button>
        </div>
      </div>
    </div>
  );
}