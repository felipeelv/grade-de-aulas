import { supabase } from '../lib/supabase';
import { Disciplina, Professor, Turma, Horario, DisponibilidadeProfessor } from '../types';

// Serviço usando os nomes EXATOS das tabelas do usuário
export class SupabaseServiceExato {
  
  // Funções de conversão entre formatos
  static diaSemanaParaString(diaSemana: number): string {
    const dias = ['', 'seg', 'ter', 'qua', 'qui', 'sex'];
    return dias[diaSemana] || 'seg';
  }

  static stringParaDiaSemana(dia: string): number {
    const dias: { [key: string]: number } = {
      'seg': 1, 'ter': 2, 'qua': 3, 'qui': 4, 'sex': 5
    };
    return dias[dia] || 1;
  }

  // ========== DISCIPLINAS ==========
  static async obterDisciplinas(): Promise<Disciplina[]> {
    try {
      const { data, error } = await supabase
        .from('disciplinas')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro ao obter disciplinas:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        cor: item.cor || '#3B82F6'
      }));
    } catch (error) {
      console.error('Erro na consulta de disciplinas:', error);
      return [];
    }
  }

  static async adicionarDisciplina(disciplina: Omit<Disciplina, 'id'>): Promise<Disciplina | null> {
    try {
      const { data, error } = await supabase
        .from('disciplinas')
        .insert([disciplina])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar disciplina:', error);
        return null;
      }

      return {
        id: data.id,
        nome: data.nome,
        cor: data.cor || '#3B82F6'
      };
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
      return null;
    }
  }

  static async atualizarDisciplina(disciplina: Disciplina): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('disciplinas')
        .update({ nome: disciplina.nome, cor: disciplina.cor })
        .eq('id', disciplina.id);

      if (error) {
        console.error('Erro ao atualizar disciplina:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar disciplina:', error);
      return false;
    }
  }

  static async removerDisciplina(id: number): Promise<boolean> {
    try {
      // Primeiro remover horários relacionados
      await supabase
        .from('horarios')
        .delete()
        .eq('disciplina_id', id);

      // Remover relações professor-disciplina
      await supabase
        .from('professor_disciplinas')
        .delete()
        .eq('disciplina_id', id);

      // Depois remover a disciplina
      const { error } = await supabase
        .from('disciplinas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover disciplina:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover disciplina:', error);
      return false;
    }
  }

  // ========== PROFESSORES ==========
  static async obterProfessores(): Promise<Professor[]> {
    try {
      const { data: professoresData, error: profError } = await supabase
        .from('professores')
        .select('*');

      if (profError) {
        console.error('Erro ao obter professores:', profError);
        return [];
      }

      const professoresComDisciplinas = await Promise.all(
        (professoresData || []).map(async (professor) => {
          // Buscar disciplinas do professor
          const { data: profDisciplinas } = await supabase
            .from('professor_disciplinas')
            .select('disciplina_id')
            .eq('professor_id', professor.id);

          // Buscar disponibilidade
          const { data: disponibilidadeData } = await supabase
            .from('disponibilidade_professores')
            .select('*')
            .eq('professor_id', professor.id);

          // Converter disponibilidade para formato correto
          const disponibilidadeFormatada: DisponibilidadeProfessor[] = [];
          
          // Gerar disponibilidade padrão se não existir
          if (!disponibilidadeData || disponibilidadeData.length === 0) {
            for (let dia = 1; dia <= 5; dia++) {
              for (let aula = 1; aula <= 6; aula++) {
                disponibilidadeFormatada.push({
                  diaSemana: dia,
                  aula: aula,
                  disponivel: true
                });
              }
            }
          } else {
            // Converter dados existentes
            disponibilidadeData.forEach(item => {
              disponibilidadeFormatada.push({
                diaSemana: item.dia_semana || 1,
                aula: item.aula || 1,
                disponivel: item.disponivel !== false
              });
            });
          }

          return {
            id: professor.id,
            nome: professor.nome,
            disciplinaIds: (profDisciplinas || []).map(pd => pd.disciplina_id),
            disponibilidade: disponibilidadeFormatada
          };
        })
      );

      return professoresComDisciplinas;
    } catch (error) {
      console.error('Erro na consulta de professores:', error);
      return [];
    }
  }

  static async adicionarProfessor(professor: Omit<Professor, 'id'>): Promise<Professor | null> {
    try {
      const { data: profData, error: profError } = await supabase
        .from('professores')
        .insert([{
          nome: professor.nome
        }])
        .select()
        .single();

      if (profError) {
        console.error('Erro ao adicionar professor:', profError);
        return null;
      }

      // Inserir disciplinas na tabela de relacionamento
      if (professor.disciplinaIds && professor.disciplinaIds.length > 0) {
        const relacionamentos = professor.disciplinaIds.map(disciplinaId => ({
          professor_id: profData.id,
          disciplina_id: disciplinaId
        }));

        await supabase
          .from('professor_disciplinas')
          .insert(relacionamentos);
      }

      // Inserir disponibilidade na tabela separada
      if (professor.disponibilidade && professor.disponibilidade.length > 0) {
        const disponibilidades = professor.disponibilidade.map(disp => ({
          professor_id: profData.id,
          dia_semana: disp.diaSemana,
          aula: disp.aula,
          disponivel: disp.disponivel
        }));

        await supabase
          .from('disponibilidade_professores')
          .insert(disponibilidades);
      }

      return {
        id: profData.id,
        nome: profData.nome,
        disciplinaIds: professor.disciplinaIds,
        disponibilidade: professor.disponibilidade
      };
    } catch (error) {
      console.error('Erro ao adicionar professor:', error);
      return null;
    }
  }

  static async atualizarProfessor(professor: Professor): Promise<boolean> {
    try {
      // Atualizar dados do professor
      const { error: profError } = await supabase
        .from('professores')
        .update({ 
          nome: professor.nome
        })
        .eq('id', professor.id);

      if (profError) {
        console.error('Erro ao atualizar professor:', profError);
        return false;
      }

      // Atualizar disciplinas na tabela de relacionamento
      // Remover relacionamentos anteriores
      await supabase
        .from('professor_disciplinas')
        .delete()
        .eq('professor_id', professor.id);

      // Inserir novos relacionamentos
      if (professor.disciplinaIds && professor.disciplinaIds.length > 0) {
        const relacionamentos = professor.disciplinaIds.map(disciplinaId => ({
          professor_id: professor.id,
          disciplina_id: disciplinaId
        }));

        await supabase
          .from('professor_disciplinas')
          .insert(relacionamentos);
      }

      // Atualizar disponibilidade
      await supabase
        .from('disponibilidade_professores')
        .delete()
        .eq('professor_id', professor.id);

      if (professor.disponibilidade && professor.disponibilidade.length > 0) {
        const disponibilidades = professor.disponibilidade.map(disp => ({
          professor_id: professor.id,
          dia_semana: disp.diaSemana,
          aula: disp.aula,
          disponivel: disp.disponivel
        }));

        await supabase
          .from('disponibilidade_professores')
          .insert(disponibilidades);
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar professor:', error);
      return false;
    }
  }

  static async removerProfessor(id: number): Promise<boolean> {
    try {
      // Remover horários do professor
      await supabase
        .from('horarios')
        .delete()
        .eq('professor_id', id);

      // Remover relações disciplina
      await supabase
        .from('professor_disciplinas')
        .delete()
        .eq('professor_id', id);

      // Remover disponibilidade
      await supabase
        .from('disponibilidade_professores')
        .delete()
        .eq('professor_id', id);

      // Remover professor
      const { error } = await supabase
        .from('professores')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover professor:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover professor:', error);
      return false;
    }
  }

  // ========== TURMAS ==========
  static async obterTurmas(): Promise<Turma[]> {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .select('*')
        .order('segmento, ano, turma');

      if (error) {
        console.error('Erro ao obter turmas:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro na consulta de turmas:', error);
      return [];
    }
  }

  static async adicionarTurma(turma: Omit<Turma, 'id'>): Promise<Turma | null> {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .insert([turma])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar turma:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao adicionar turma:', error);
      return null;
    }
  }

  static async atualizarTurma(turma: Turma): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('turmas')
        .update({
          segmento: turma.segmento,
          ano: turma.ano,
          turma: turma.turma,
          periodo: turma.periodo
        })
        .eq('id', turma.id);

      if (error) {
        console.error('Erro ao atualizar turma:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      return false;
    }
  }

  static async removerTurma(id: number): Promise<boolean> {
    try {
      // Primeiro remover horários da turma
      await supabase
        .from('horarios')
        .delete()
        .eq('turma_id', id);

      // Depois remover a turma
      const { error } = await supabase
        .from('turmas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover turma:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover turma:', error);
      return false;
    }
  }

  // ========== HORÁRIOS ==========
  static async obterHorarios(): Promise<Horario[]> {
    try {
      const { data, error } = await supabase
        .from('horarios')
        .select('*');

      if (error) {
        console.error('Erro ao obter horários:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        turmaId: item.turma_id,
        diaSemana: this.stringParaDiaSemana(item.dia),
        aula: item.aula,
        professorId: item.professor_id,
        disciplinaId: item.disciplina_id
      }));
    } catch (error) {
      console.error('Erro na consulta de horários:', error);
      return [];
    }
  }

  static async adicionarHorario(horario: Omit<Horario, 'id'>): Promise<Horario | null> {
    try {
      const { data, error } = await supabase
        .from('horarios')
        .insert([{
          turma_id: horario.turmaId,
          dia: this.diaSemanaParaString(horario.diaSemana),
          aula: horario.aula,
          professor_id: horario.professorId,
          disciplina_id: horario.disciplinaId
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar horário:', error);
        return null;
      }

      return {
        id: data.id,
        turmaId: data.turma_id,
        diaSemana: this.stringParaDiaSemana(data.dia),
        aula: data.aula,
        professorId: data.professor_id,
        disciplinaId: data.disciplina_id
      };
    } catch (error) {
      console.error('Erro ao adicionar horário:', error);
      return null;
    }
  }

  static async atualizarHorario(horario: Horario): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('horarios')
        .update({
          turma_id: horario.turmaId,
          dia: this.diaSemanaParaString(horario.diaSemana),
          aula: horario.aula,
          professor_id: horario.professorId,
          disciplina_id: horario.disciplinaId
        })
        .eq('id', horario.id);

      if (error) {
        console.error('Erro ao atualizar horário:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar horário:', error);
      return false;
    }
  }

  static async removerHorario(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('horarios')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover horário:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover horário:', error);
      return false;
    }
  }

  static async moverHorario(horarioId: number, novoDiaSemana: number, novaAula: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('horarios')
        .update({
          dia: this.diaSemanaParaString(novoDiaSemana),
          aula: novaAula
        })
        .eq('id', horarioId);

      if (error) {
        console.error('Erro ao mover horário:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao mover horário:', error);
      return false;
    }
  }

  // ========== MÉTODOS ADICIONAIS ==========
  static async testarConexao(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('disciplinas')
        .select('count(*)')
        .single();

      if (error) {
        console.error('Erro na conexão:', error);
        return false;
      }

      console.log('✅ Conexão com Supabase funcionando!', data);
      return true;
    } catch (error) {
      console.error('Erro no teste de conexão:', error);
      return false;
    }
  }

  static async carregarEstadoCompleto() {
    try {
      const [disciplinas, professores, turmas, horarios] = await Promise.all([
        this.obterDisciplinas(),
        this.obterProfessores(), 
        this.obterTurmas(),
        this.obterHorarios()
      ]);

      return {
        disciplinas,
        professores,
        turmas,
        horarios,
        conflitos: []
      };
    } catch (error) {
      console.error('Erro ao carregar estado completo:', error);
      return {
        disciplinas: [],
        professores: [],
        turmas: [],
        horarios: [],
        conflitos: []
      };
    }
  }

  static async migrarDadosLocalStorage(): Promise<boolean> {
    try {
      console.log('📦 Verificando migração de dados do localStorage...');
      return true;
    } catch (error) {
      console.error('Erro na migração:', error);
      return false;
    }
  }
}
