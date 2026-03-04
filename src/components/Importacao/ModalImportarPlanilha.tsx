import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, AlertTriangle, CheckCircle, Loader2, Eye } from 'lucide-react';
import { useSistema } from '../../context/SistemaContext';
import { ImportPlanilhaService, ResultadoImportacao } from '../../services/importPlanilhaService';
import * as XLSX from 'xlsx';

interface ModalImportarPlanilhaProps {
  onFechar: () => void;
}

type Etapa = 'upload' | 'preview' | 'importando' | 'resultado';

export function ModalImportarPlanilha({ onFechar }: ModalImportarPlanilhaProps) {
  const { estado, importarPlanilha } = useSistema();
  const inputRef = useRef<HTMLInputElement>(null);
  const [etapa, setEtapa] = useState<Etapa>('upload');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const [resultadoFinal, setResultadoFinal] = useState<{ sucesso: boolean; horariosImportados: number; erros: string[] } | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const [erro, setErro] = useState('');

  const processarArquivo = useCallback(async (file: File) => {
    setErro('');
    setArquivo(file);

    const extensoesValidas = ['.xlsx', '.xls', '.csv'];
    const extensao = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!extensoesValidas.includes(extensao)) {
      setErro('Formato de arquivo nao suportado. Use .xlsx, .xls ou .csv');
      return;
    }

    try {
      const wb = await ImportPlanilhaService.lerArquivo(file);
      setWorkbook(wb);

      const res = ImportPlanilhaService.processarPlanilha(
        wb,
        estado.disciplinas,
        estado.professores,
        estado.turmas
      );
      setResultado(res);
      setEtapa('preview');
    } catch (e) {
      setErro('Erro ao ler o arquivo. Verifique se o formato esta correto.');
      console.error('Erro ao processar planilha:', e);
    }
  }, [estado]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processarArquivo(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setArrastando(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processarArquivo(file);
  }, [processarArquivo]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastando(true);
  };

  const handleDragLeave = () => {
    setArrastando(false);
  };

  const handleImportar = async () => {
    if (!resultado?.dados) return;

    setEtapa('importando');

    try {
      const res = await importarPlanilha(resultado.dados);
      setResultadoFinal(res);
      setEtapa('resultado');
    } catch (e) {
      setResultadoFinal({
        sucesso: false,
        horariosImportados: 0,
        erros: ['Erro inesperado durante a importacao.'],
      });
      setEtapa('resultado');
    }
  };

  const handleVoltar = () => {
    setEtapa('upload');
    setArquivo(null);
    setWorkbook(null);
    setResultado(null);
    setResultadoFinal(null);
    setErro('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Importar Planilha</h2>
              <p className="text-sm text-gray-500">Importe sua grade de horarios via Excel ou CSV</p>
            </div>
          </div>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Conteudo */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Etapa: Upload */}
          {etapa === 'upload' && (
            <div className="space-y-6">
              {/* Zona de drop */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
                  ${arrastando
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }
                `}
              >
                <Upload className={`h-12 w-12 mx-auto mb-4 ${arrastando ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-lg font-medium text-gray-700 mb-1">
                  Arraste o arquivo aqui ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500">
                  Suporta .xlsx, .xls e .csv
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Erro */}
              {erro && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{erro}</p>
                </div>
              )}

              {/* Instrucoes de formato */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900 text-sm">Formatos aceitos:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Formato Tabela:</span> Colunas com Turma, Dia, Aula, Disciplina, Professor (uma linha por aula)
                  </div>
                  <div>
                    <span className="font-medium">Formato Grade:</span> Uma aba por turma, linhas = aulas (1-6), colunas = dias da semana (Segunda a Sexta)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Etapa: Preview */}
          {etapa === 'preview' && resultado && (
            <div className="space-y-6">
              {/* Info do arquivo */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">{arquivo?.name}</p>
                    <p className="text-sm text-blue-700">
                      Formato detectado: {resultado.formato === 'tabela' ? 'Tabela' : resultado.formato === 'grade' ? 'Grade' : 'Desconhecido'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Erros da analise */}
              {resultado.erros.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900 mb-1">Avisos:</p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {resultado.erros.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {resultado.sucesso && resultado.dados && (
                <>
                  {/* Resumo do que sera importado */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{resultado.dados.horarios.length}</p>
                      <p className="text-sm text-gray-600">Horarios</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{resultado.dados.disciplinas.length}</p>
                      <p className="text-sm text-gray-600">Novas Disciplinas</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">{resultado.dados.professores.length}</p>
                      <p className="text-sm text-gray-600">Novos Professores</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-orange-600">{resultado.dados.turmas.length}</p>
                      <p className="text-sm text-gray-600">Novas Turmas</p>
                    </div>
                  </div>

                  {/* Preview dos dados */}
                  {resultado.preview.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Eye className="h-4 w-4 text-gray-500" />
                        <h4 className="font-medium text-gray-900 text-sm">Preview dos dados (primeiras linhas):</h4>
                      </div>
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full text-xs">
                          <tbody>
                            {resultado.preview.slice(0, 8).map((row, i) => (
                              <tr key={i} className={i === 0 ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}>
                                {row.map((cell, j) => (
                                  <td key={j} className="px-3 py-2 border-b border-gray-100 whitespace-nowrap">
                                    {cell || '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Detalhes dos novos itens */}
                  {resultado.dados.disciplinas.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-2">Novas disciplinas a criar:</h4>
                      <div className="flex flex-wrap gap-2">
                        {resultado.dados.disciplinas.map((d, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            {d.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {resultado.dados.turmas.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-2">Novas turmas a criar:</h4>
                      <div className="flex flex-wrap gap-2">
                        {resultado.dados.turmas.map((t, i) => (
                          <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                            {t.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {resultado.dados.professores.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-2">Novos professores a criar:</h4>
                      <div className="flex flex-wrap gap-2">
                        {resultado.dados.professores.map((p, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {p.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Etapa: Importando */}
          {etapa === 'importando' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <p className="text-lg font-medium text-gray-700">Importando dados...</p>
              <p className="text-sm text-gray-500">Isso pode levar alguns segundos</p>
            </div>
          )}

          {/* Etapa: Resultado */}
          {etapa === 'resultado' && resultadoFinal && (
            <div className="space-y-6">
              <div className={`text-center py-8 ${resultadoFinal.sucesso ? 'text-green-600' : 'text-yellow-600'}`}>
                {resultadoFinal.sucesso ? (
                  <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                ) : (
                  <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
                )}
                <h3 className="text-xl font-semibold mb-2">
                  {resultadoFinal.sucesso ? 'Importacao concluida!' : 'Importacao concluida com avisos'}
                </h3>
                <p className="text-gray-600">
                  {resultadoFinal.horariosImportados} horarios importados com sucesso.
                </p>
              </div>

              {resultadoFinal.erros.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-medium text-yellow-900 mb-2">Erros encontrados:</p>
                  <ul className="text-sm text-yellow-700 space-y-1 max-h-40 overflow-y-auto">
                    {resultadoFinal.erros.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          {etapa === 'upload' && (
            <button
              onClick={onFechar}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}

          {etapa === 'preview' && (
            <>
              <button
                onClick={handleVoltar}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Voltar
              </button>
              {resultado?.sucesso && resultado.dados && resultado.dados.horarios.length > 0 ? (
                <button
                  onClick={handleImportar}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Importar {resultado.dados.horarios.length} horarios</span>
                </button>
              ) : (
                <button
                  onClick={handleVoltar}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                  disabled
                >
                  Nenhum dado para importar
                </button>
              )}
            </>
          )}

          {etapa === 'importando' && (
            <div className="w-full text-center text-sm text-gray-500">
              Aguarde...
            </div>
          )}

          {etapa === 'resultado' && (
            <button
              onClick={onFechar}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium ml-auto"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
