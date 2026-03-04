import * as XLSX from 'xlsx';
import { Disciplina, Professor, Turma, Horario } from '../types';
import { CORES_DISCIPLINAS } from '../data/mockData';

export interface DadosImportados {
  disciplinas: Omit<Disciplina, 'id'>[];
  professores: Omit<Professor, 'id'>[];
  turmas: Omit<Turma, 'id'>[];
  horarios: { turma: string; professor: string; disciplina: string; diaSemana: number; aula: number }[];
}

export interface ResultadoImportacao {
  sucesso: boolean;
  dados: DadosImportados | null;
  erros: string[];
  formato: 'tabela' | 'grade' | 'desconhecido';
  preview: string[][];
}

const DIAS_MAP: Record<string, number> = {
  'segunda': 1, 'segunda-feira': 1, 'seg': 1, '2ª': 1, '2a': 1,
  'terca': 2, 'terça': 2, 'terça-feira': 2, 'ter': 2, '3ª': 2, '3a': 2,
  'quarta': 3, 'quarta-feira': 3, 'qua': 3, '4ª': 3, '4a': 3,
  'quinta': 4, 'quinta-feira': 4, 'qui': 4, '5ª': 4, '5a': 4,
  'sexta': 5, 'sexta-feira': 5, 'sex': 5, '6ª': 5, '6a': 5,
};

function normalizarTexto(texto: string): string {
  return texto.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function parseDia(valor: string): number | null {
  const normalizado = normalizarTexto(valor);
  return DIAS_MAP[normalizado] ?? null;
}

function parseAula(valor: string): number | null {
  const num = parseInt(valor.replace(/[^\d]/g, ''), 10);
  if (num >= 1 && num <= 6) return num;
  return null;
}

function detectarFormatoGrade(headers: string[]): boolean {
  const headersNorm = headers.map(h => normalizarTexto(h));
  const diasEncontrados = headersNorm.filter(h =>
    Object.keys(DIAS_MAP).some(d => h.includes(d))
  );
  return diasEncontrados.length >= 3;
}

function detectarFormatoTabela(headers: string[]): boolean {
  const headersNorm = headers.map(h => normalizarTexto(h));
  const colunasEsperadas = ['turma', 'dia', 'aula', 'disciplina', 'professor'];
  const encontradas = colunasEsperadas.filter(col =>
    headersNorm.some(h => h.includes(col))
  );
  return encontradas.length >= 3;
}

function mapearColunasDia(headers: string[]): Record<number, number> {
  const mapa: Record<number, number> = {};
  headers.forEach((h, idx) => {
    const dia = parseDia(h);
    if (dia !== null) {
      mapa[idx] = dia;
    }
  });
  return mapa;
}

function extrairTurmaDoNomeAba(nomeAba: string): { segmento: string; ano: string; turma: string; periodo: string; nome: string } {
  const nome = nomeAba.trim();
  let segmento = 'Ensino Fundamental II';
  let ano = '';
  let turma = 'A';
  const periodo = 'Manhã';

  const matchAno = nome.match(/(\d+)[º°]?\s*/);
  if (matchAno) {
    ano = matchAno[1] + 'º';
  }

  const matchTurma = nome.match(/[º°]\s*([A-F])/i);
  if (matchTurma) {
    turma = matchTurma[1].toUpperCase();
  }

  const nomeNorm = normalizarTexto(nome);
  if (nomeNorm.includes('fund') && nomeNorm.includes('i') && !nomeNorm.includes('ii')) {
    segmento = 'Ensino Fundamental I';
  } else if (nomeNorm.includes('fund') && nomeNorm.includes('ii')) {
    segmento = 'Ensino Fundamental II';
  } else if (nomeNorm.includes('medio') || nomeNorm.includes('em')) {
    segmento = 'Ensino Médio';
  }

  return { segmento, ano, turma, periodo, nome };
}

function processarFormatoGrade(
  sheet: XLSX.WorkSheet,
  nomeAba: string
): { horarios: DadosImportados['horarios']; turmaInfo: ReturnType<typeof extrairTurmaDoNomeAba> } {
  const dados = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as string[][];
  const horarios: DadosImportados['horarios'] = [];
  const turmaInfo = extrairTurmaDoNomeAba(nomeAba);

  if (dados.length < 2) return { horarios, turmaInfo };

  const headers = dados[0].map(h => String(h || ''));
  const colDias = mapearColunasDia(headers);

  for (let i = 1; i < dados.length; i++) {
    const row = dados[i];
    if (!row || row.length === 0) continue;

    const aulaStr = String(row[0] || '');
    const aula = parseAula(aulaStr);
    if (!aula) continue;

    for (const [colIdxStr, diaSemana] of Object.entries(colDias)) {
      const colIdx = parseInt(colIdxStr, 10);
      const celula = String(row[colIdx] || '').trim();
      if (!celula || celula === '-' || celula === '') continue;

      const partes = celula.split(/[\n\r\/\-]+/).map(p => p.trim()).filter(Boolean);
      const disciplina = partes[0] || celula;
      const professor = partes[1] || '';

      horarios.push({
        turma: turmaInfo.nome,
        professor,
        disciplina,
        diaSemana,
        aula,
      });
    }
  }

  return { horarios, turmaInfo };
}

function processarFormatoTabela(
  sheet: XLSX.WorkSheet
): DadosImportados['horarios'] {
  const dados = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
  const horarios: DadosImportados['horarios'] = [];

  for (const row of dados) {
    const keys = Object.keys(row);
    const keysNorm = keys.map(k => ({ original: k, norm: normalizarTexto(k) }));

    const colTurma = keysNorm.find(k => k.norm.includes('turma'))?.original;
    const colDia = keysNorm.find(k => k.norm.includes('dia'))?.original;
    const colAula = keysNorm.find(k => k.norm.includes('aula') || k.norm.includes('horario'))?.original;
    const colDisciplina = keysNorm.find(k => k.norm.includes('disciplina') || k.norm.includes('materia'))?.original;
    const colProfessor = keysNorm.find(k => k.norm.includes('professor') || k.norm.includes('prof'))?.original;

    const turma = colTurma ? String(row[colTurma] || '').trim() : '';
    const diaStr = colDia ? String(row[colDia] || '').trim() : '';
    const aulaStr = colAula ? String(row[colAula] || '').trim() : '';
    const disciplina = colDisciplina ? String(row[colDisciplina] || '').trim() : '';
    const professor = colProfessor ? String(row[colProfessor] || '').trim() : '';

    const dia = parseDia(diaStr);
    const aula = parseAula(aulaStr);

    if (!turma || !disciplina || dia === null || aula === null) continue;

    horarios.push({ turma, professor, disciplina, diaSemana: dia, aula });
  }

  return horarios;
}

export class ImportPlanilhaService {

  static async lerArquivo(file: File): Promise<XLSX.WorkBook> {
    const buffer = await file.arrayBuffer();
    return XLSX.read(buffer, { type: 'array' });
  }

  static obterPreview(workbook: XLSX.WorkBook): { nomeAba: string; dados: string[][] }[] {
    return workbook.SheetNames.map(nomeAba => {
      const sheet = workbook.Sheets[nomeAba];
      const dados = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as string[][];
      return {
        nomeAba,
        dados: dados.slice(0, 10).map(row =>
          (row || []).map(cell => String(cell ?? ''))
        ),
      };
    });
  }

  static processarPlanilha(
    workbook: XLSX.WorkBook,
    disciplinasExistentes: Disciplina[],
    professoresExistentes: Professor[],
    turmasExistentes: Turma[]
  ): ResultadoImportacao {
    const erros: string[] = [];
    const todasHorarios: DadosImportados['horarios'] = [];
    const turmasInfo: ReturnType<typeof extrairTurmaDoNomeAba>[] = [];
    let formato: 'tabela' | 'grade' | 'desconhecido' = 'desconhecido';

    for (const nomeAba of workbook.SheetNames) {
      const sheet = workbook.Sheets[nomeAba];
      const dados = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as string[][];

      if (!dados || dados.length < 2) {
        erros.push(`Aba "${nomeAba}": sem dados suficientes`);
        continue;
      }

      const headers = dados[0].map(h => String(h || ''));

      if (detectarFormatoTabela(headers)) {
        formato = 'tabela';
        const horarios = processarFormatoTabela(sheet);
        todasHorarios.push(...horarios);
      } else if (detectarFormatoGrade(headers)) {
        formato = 'grade';
        const { horarios, turmaInfo } = processarFormatoGrade(sheet, nomeAba);
        todasHorarios.push(...horarios);
        turmasInfo.push(turmaInfo);
      } else {
        // Tentar formato grade com a primeira linha como possível header de dias
        const { horarios, turmaInfo } = processarFormatoGrade(sheet, nomeAba);
        if (horarios.length > 0) {
          formato = 'grade';
          todasHorarios.push(...horarios);
          turmasInfo.push(turmaInfo);
        } else {
          erros.push(`Aba "${nomeAba}": formato não reconhecido. Use formato tabela (colunas: Turma, Dia, Aula, Disciplina, Professor) ou formato grade (linhas = aulas, colunas = dias).`);
        }
      }
    }

    if (todasHorarios.length === 0) {
      return {
        sucesso: false,
        dados: null,
        erros: erros.length > 0 ? erros : ['Nenhum horário encontrado na planilha.'],
        formato,
        preview: [],
      };
    }

    // Extrair disciplinas únicas
    const disciplinasUnicas = [...new Set(todasHorarios.map(h => h.disciplina).filter(Boolean))];
    const novasDisciplinas: Omit<Disciplina, 'id'>[] = disciplinasUnicas
      .filter(nome => !disciplinasExistentes.some(d => normalizarTexto(d.nome) === normalizarTexto(nome)))
      .map((nome, idx) => ({
        nome,
        cor: CORES_DISCIPLINAS[idx % CORES_DISCIPLINAS.length],
      }));

    // Extrair professores únicos
    const professoresUnicos = [...new Set(todasHorarios.map(h => h.professor).filter(Boolean))];
    const novosProfessores: Omit<Professor, 'id'>[] = professoresUnicos
      .filter(nome => !professoresExistentes.some(p => normalizarTexto(p.nome) === normalizarTexto(nome)))
      .map(nome => ({
        nome,
        disciplinaIds: [],
        disponibilidade: [],
      }));

    // Extrair turmas únicas
    const turmasUnicas = [...new Set(todasHorarios.map(h => h.turma).filter(Boolean))];
    const novasTurmas: Omit<Turma, 'id'>[] = turmasUnicas
      .filter(nome => !turmasExistentes.some(t => normalizarTexto(t.nome) === normalizarTexto(nome)))
      .map(nome => {
        const info = turmasInfo.find(t => t.nome === nome) || extrairTurmaDoNomeAba(nome);
        return {
          nome,
          segmento: info.segmento,
          ano: info.ano,
          turma: info.turma,
          periodo: info.periodo,
        };
      });

    const preview = this.obterPreview(workbook);
    const previewData = preview.length > 0 ? preview[0].dados : [];

    return {
      sucesso: true,
      dados: {
        disciplinas: novasDisciplinas,
        professores: novosProfessores,
        turmas: novasTurmas,
        horarios: todasHorarios,
      },
      erros,
      formato,
      preview: previewData,
    };
  }

  static resolverIds(
    dados: DadosImportados,
    disciplinasAtuais: Disciplina[],
    professoresAtuais: Professor[],
    turmasAtuais: Turma[]
  ): Omit<Horario, 'id'>[] {
    const horarios: Omit<Horario, 'id'>[] = [];

    for (const h of dados.horarios) {
      const disciplina = disciplinasAtuais.find(d =>
        normalizarTexto(d.nome) === normalizarTexto(h.disciplina)
      );
      const professor = h.professor
        ? professoresAtuais.find(p => normalizarTexto(p.nome) === normalizarTexto(h.professor))
        : null;
      const turma = turmasAtuais.find(t =>
        normalizarTexto(t.nome) === normalizarTexto(h.turma)
      );

      if (!disciplina) continue;
      if (!turma) continue;

      horarios.push({
        turmaId: turma.id,
        professorId: professor?.id ?? 0,
        disciplinaId: disciplina.id,
        diaSemana: h.diaSemana,
        aula: h.aula,
      });
    }

    return horarios;
  }
}
