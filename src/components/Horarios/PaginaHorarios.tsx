import React, { useState, useMemo } from 'react';
import { useSistema } from '../../context/SistemaContext';
import { FiltrosHorarios } from './FiltrosHorarios';
import { GradeHorarios } from './GradeHorarios';
import { GradeProfessor } from './GradeProfessor';
import { ModalAdicionarHorario } from './ModalAdicionarHorario';
import { Edit3, Save, X, Printer } from 'lucide-react';

export function PaginaHorarios() {
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

  // Filtrar horários baseado nos filtros selecionados
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

  // Obter turma selecionada para a grade
  const turmaSelecionada = turmaFiltro 
    ? estado.turmas.find(t => t.id === Number(turmaFiltro))
    : null;

  // Obter professor selecionado para a grade
  const professorSelecionado = professorFiltro 
    ? estado.professores.find(p => p.id === Number(professorFiltro))
    : null;

  // Determinar se deve mostrar grade do professor (professor selecionado e sem turma específica)
  const mostrarGradeProfessor = professorSelecionado && !turmaFiltro;

  const handleAdicionarHorario = (diaSemana: number, aula: number) => {
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
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setSlotSelecionado(null);
  };

  const toggleModoEdicao = () => {
    setModoEdicao(!modoEdicao);
  };

  const handleImprimir = () => {
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir a grade.');
      return;
    }

    // Obter o nome da turma ou professor para o título
    const titulo = mostrarGradeProfessor
      ? `Grade de Horários - Professor ${professorSelecionado?.nome}`
      : turmaSelecionada
      ? `Grade de Horários - ${turmaSelecionada.nome}`
      : 'Grade de Horários';

    // HTML para impressão
    const htmlParaImprimir = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${titulo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .logo { display: inline-block; margin-right: 15px; vertical-align: middle; }
            .title { display: inline-block; vertical-align: middle; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 8px; text-align: center; font-size: 12px; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .slot-ocupado { background-color: #e3f2fd; }
            .slot-vazio { background-color: #fafafa; color: #999; }
            @media print { 
              body { margin: 0; } 
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <img src="/logo-colegio-eleve.png" alt="Colégio Eleve" style="height: 40px; width: 40px; object-fit: contain;">
            </div>
            <div class="title">
              <h1>Sistema de Gestão de Horários</h1>
              <h2>Colégio Eleve</h2>
              <h3>${titulo}</h3>
            </div>
          </div>
          ${gerarTabelaParaImpressao()}
        </body>
      </html>
    `;

    printWindow.document.write(htmlParaImprimir);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const gerarTabelaParaImpressao = () => {
    const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    const aulas = [1, 2, 3, 4, 5, 6];

    let tabela = `
      <table>
        <thead>
          <tr>
            <th>Horário</th>
            ${dias.map(dia => `<th>${dia}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;

    aulas.forEach(aula => {
      tabela += `<tr><td><strong>Aula ${aula}</strong></td>`;
      
      [1, 2, 3, 4, 5].forEach(diaSemana => {
        const horario = horariosFiltrados.find(
          h => h.diaSemana === diaSemana && h.aula === aula
        );
        
        if (horario) {
          const disciplina = estado.disciplinas.find(d => d.id === horario.disciplinaId);
          const professor = estado.professores.find(p => p.id === horario.professorId);
          const turma = estado.turmas.find(t => t.id === horario.turmaId);
          
          // Se é visualização por professor, mostrar turma. Senão, mostrar disciplina
          if (mostrarGradeProfessor) {
            tabela += `
              <td class="slot-ocupado">
                <strong>${turma?.ano}${turma?.turma || 'N/A'}</strong><br/>
                <small>${turma?.segmento === 'Ensino Fundamental I' ? 'Fund I' :
                         turma?.segmento === 'Ensino Fundamental II' ? 'Fund II' :
                         turma?.segmento === 'Ensino Médio' ? 'EM' : turma?.segmento || 'N/A'}</small><br/>
                <small>${disciplina?.nome || 'N/A'}</small>
              </td>
            `;
          } else {
            tabela += `
              <td class="slot-ocupado">
                <strong>${disciplina?.nome || 'N/A'}</strong><br/>
                <small>${professor?.nome || 'N/A'}</small>
              </td>
            `;
          }
        } else {
          tabela += `<td class="slot-vazio">-</td>`;
        }
      });
      
      tabela += '</tr>';
    });

    tabela += '</tbody></table>';
    return tabela;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciamento de Horários
          </h1>
          <p className="text-gray-600 mt-1">
            Visualize e edite a grade de horários das turmas
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {/* Botão de imprimir */}
          <button
            onClick={handleImprimir}
            disabled={!turmaSelecionada && !mostrarGradeProfessor}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${
                !turmaSelecionada && !mostrarGradeProfessor
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
            title={!turmaSelecionada && !mostrarGradeProfessor ? 'Selecione uma turma ou professor para imprimir' : 'Imprimir grade de horários'}
          >
            <Printer className="h-5 w-5" />
            <span>Imprimir</span>
          </button>
          
          {/* Botão de modo de edição */}
          <button
            onClick={toggleModoEdicao}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${
                modoEdicao
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }
            `}
          >
            {modoEdicao ? (
              <>
                <Save className="h-5 w-5" />
                <span>Salvar Alterações</span>
              </>
            ) : (
              <>
                <Edit3 className="h-5 w-5" />
                <span>Modo Edição</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <FiltrosHorarios
        turmaFiltro={turmaFiltro}
        professorFiltro={professorFiltro}
        onTurmaChange={setTurmaFiltro}
        onProfessorChange={setProfessorFiltro}
        turmas={estado.turmas}
        professores={estado.professores}
      />

      {/* Informações da turma selecionada */}
      {turmaSelecionada && !mostrarGradeProfessor && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">
                {turmaSelecionada.segmento} - {turmaSelecionada.ano}{turmaSelecionada.turma}
              </h3>
              <p className="text-sm text-blue-700">
                Período: {turmaSelecionada.periodo}
              </p>
            </div>
            
            {modoEdicao && (
              <div className="text-sm text-blue-700">
                <span className="font-medium">Modo Edição Ativo:</span> Arraste horários ou clique em "+" para adicionar
              </div>
            )}
          </div>
        </div>
      )}

      {/* Informações do professor selecionado */}
      {mostrarGradeProfessor && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-green-900">
                Visualização por Professor: {professorSelecionado.nome}
              </h3>
              <p className="text-sm text-green-700">
                Mostrando todas as turmas onde este professor leciona
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grade de Horários */}
      {mostrarGradeProfessor ? (
        <GradeProfessor
          professor={professorSelecionado}
          horarios={estado.horarios}
          turmas={estado.turmas}
          disciplinas={estado.disciplinas}
        />
      ) : (
        <GradeHorarios
          horarios={horariosFiltrados}
          turmaSelecionada={turmaSelecionada}
          modoEdicao={modoEdicao}
          onAdicionarHorario={handleAdicionarHorario}
          conflitos={estado.conflitos}
        />
      )}

      {/* Modal para adicionar horário */}
      {modalAberto && slotSelecionado && (
        <ModalAdicionarHorario
          turmaId={slotSelecionado.turmaId}
          diaSemana={slotSelecionado.diaSemana}
          aula={slotSelecionado.aula}
          onFechar={handleFecharModal}
        />
      )}

      {/* Instruções */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Instruções:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Selecione uma turma para visualizar sua grade de horários</li>
          <li>• Use o filtro de professor para ver apenas as aulas de um professor específico</li>
          <li>• <strong>Filtro especial:</strong> Selecione um professor e deixe "Todas as turmas" para ver a grade completa do professor</li>
          <li>• Ative o "Modo Edição" para arrastar horários ou adicionar novos</li>
          <li>• <strong>🗑️ Lixeira inteligente:</strong> No modo edição, arraste qualquer horário para a lixeira no canto direito para removê-lo</li>
          <li>• <strong>💡 Feedback visual:</strong> A lixeira fica vermelha quando você arrasta um horário sobre ela</li>
          <li>• Horários com conflitos aparecem com borda vermelha pulsante</li>
          <li>• Passe o mouse sobre o ícone de alerta para ver detalhes do conflito</li>
        </ul>
      </div>
    </div>
  );
}