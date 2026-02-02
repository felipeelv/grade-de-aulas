import React from 'react';
import { AlertTriangle, CheckCircle, Info, Clock, Users } from 'lucide-react';
import { ConflitoDados } from '../../types';
import { useSistema } from '../../context/SistemaContext';

interface ValidadorConflitosProps {
  conflitos: ConflitoDados[];
  className?: string;
}

export function ValidadorConflitos({ conflitos, className = '' }: ValidadorConflitosProps) {
  const { obterProfessorPorId, obterDisciplinaPorId, obterTurmaPorId } = useSistema();

  if (conflitos.length === 0) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-green-900">Nenhum conflito detectado</h4>
            <p className="text-sm text-green-700 mt-1">
              Todos os horários estão organizados corretamente sem sobreposições.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Resumo dos conflitos */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-900">
              {conflitos.length} conflito{conflitos.length !== 1 ? 's' : ''} detectado{conflitos.length !== 1 ? 's' : ''}
            </h4>
            <p className="text-sm text-red-700 mt-1">
              Professores não podem estar em múltiplas turmas no mesmo horário.
            </p>
          </div>
        </div>
      </div>

      {/* Lista detalhada dos conflitos */}
      <div className="space-y-3">
        {conflitos.map((conflito, index) => {
          const horariosConflito = conflito.horarios;
          const professor = horariosConflito.length > 0 ? obterProfessorPorId(horariosConflito[0].professorId) : null;
          
          if (!professor || horariosConflito.length < 2) return null;

          return (
            <div key={index} className="bg-white border border-red-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="h-4 w-4 text-red-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h5 className="font-semibold text-gray-900">{professor.nome}</h5>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      Conflito
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    Professor agendado em múltiplas turmas no mesmo horário:
                  </p>
                  
                  <div className="space-y-2">
                    {horariosConflito.map((horario, horarioIndex) => {
                      const disciplina = obterDisciplinaPorId(horario.disciplinaId);
                      const turma = obterTurmaPorId(horario.turmaId);
                      const diasSemana = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
                      
                      return (
                        <div 
                          key={horarioIndex}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border-l-4 border-red-400"
                        >
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: disciplina?.cor || '#6B7280' }}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="font-medium text-gray-900">
                                {disciplina?.nome || 'Disciplina'}
                              </span>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-700">
                                {turma ? `${turma.segmento} ${turma.ano}${turma.turma}` : 'Turma'}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{diasSemana[horario.diaSemana]} - {horario.aula}ª aula</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Sugestão de resolução */}
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Como resolver:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Remova um dos horários conflitantes</li>
                          <li>• Mova um horário para um slot diferente</li>
                          <li>• Atribua outro professor a uma das disciplinas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dicas gerais */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Dicas para evitar conflitos:</p>
            <ul className="space-y-1 text-xs">
              <li>• Planeje os horários dos professores com antecedência</li>
              <li>• Considere a disponibilidade de cada professor</li>
              <li>• Use o modo edição para reorganizar horários facilmente</li>
              <li>• Conflitos são detectados automaticamente em tempo real</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
