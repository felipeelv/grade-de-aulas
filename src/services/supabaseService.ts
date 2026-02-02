import { supabase } from '../lib/supabase';
import { Disciplina, Professor, Turma, Horario, EstadoSistema } from '../types';

// Serviço para substituir o localStorage com Supabase
export class SupabaseService {
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

      return data || [];
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

      console.log('✅ Disciplina adicionada:', data);
      return data;
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
      return null;
    }
  }

  static async atualizarDisciplina(disciplina: Disciplina): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('disciplinas')
        .update({
          nome: disciplina.nome,
          cor: disciplina.cor
        })
        .eq('id', disciplina.id);

      if (error) {
        console.error('Erro ao atualizar disciplina:', error);
        return false;
      }

      console.log('✅ Disciplina atualizada:', disciplina.id);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar disciplina:', error);
      return false;
    }
  }

  static async removerDisciplina(id: number): Promise<boolean> {
    try {
      // Primeiro, remover horários relacionados
      await supabase
        .from('horarios')
        .delete()
        .eq('disciplina_id', id);

      // Depois, remover a disciplina
      const { error } = await supabase
        .from('disciplinas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover disciplina:', error);
        return false;
      }

      console.log('✅ Disciplina removida:', id);
      return true;
    } catch (error) {
      console.error('Erro ao remover disciplina:', error);
      return false;
    }
  }

  // ========== PROFESSORES ==========
  static async obterProfessores(): Promise<Professor[]> {
    try {
      const { data, error } = await supabase
        .from('professores')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro ao obter professores:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro na consulta de professores:', error);
      return [];
    }
  }

  static async adicionarProfessor(professor: Omit<Professor, 'id'>): Promise<Professor | null> {
    try {
      const { data, error } = await supabase
        .from('professores')
        .insert([{
          nome: professor.nome,
          disciplina_ids: professor.disciplinaIds,
          disponibilidade: professor.disponibilidade
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar professor:', error);
        return null;
      }

      // Converter de snake_case para camelCase
      const professorFormatado: Professor = {
        id: data.id,
        nome: data.nome,
        disciplinaIds: data.disciplina_ids,
        disponibilidade: data.disponibilidade
      };

      console.log('✅ Professor adicionado:', professorFormatado);
      return professorFormatado;
    } catch (error) {
      console.error('Erro ao adicionar professor:', error);
      return null;
    }
  }

  static async atualizarProfessor(professor: Professor): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('professores')
        .update({
          nome: professor.nome,
          disciplina_ids: professor.disciplinaIds,
          disponibilidade: professor.disponibilidade
        })
        .eq('id', professor.id);

      if (error) {
        console.error('Erro ao atualizar professor:', error);
        return false;
      }

      console.log('✅ Professor atualizado:', professor.id);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar professor:', error);
      return false;
    }
  }

  static async removerProfessor(id: number): Promise<boolean> {
    try {
      // Primeiro, remover horários relacionados
      await supabase
        .from('horarios')
        .delete()
        .eq('professor_id', id);

      // Depois, remover o professor
      const { error } = await supabase
        .from('professores')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover professor:', error);
        return false;
      }

      console.log('✅ Professor removido:', id);
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
        .order('nome');

      if (error) {
        console.error('Erro ao obter turmas:', error);
        return [];
      }

      // Converter de snake_case para camelCase
      return (data || []).map(turma => ({
        id: turma.id,
        nome: turma.nome,
        segmento: turma.segmento || 'Ensino Fundamental I',
        ano: turma.ano || '1º',
        turma: turma.turma || 'A',
        periodo: turma.periodo || 'Manhã'
      }));
    } catch (error) {
      console.error('Erro na consulta de turmas:', error);
      return [];
    }
  }

  static async adicionarTurma(turma: Omit<Turma, 'id'>): Promise<Turma | null> {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .insert([{
          nome: turma.nome,
          segmento: turma.segmento,
          ano: turma.ano,
          turma: turma.turma,
          periodo: turma.periodo
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar turma:', error);
        return null;
      }

      // Converter de snake_case para camelCase
      const turmaFormatada: Turma = {
        id: data.id,
        nome: data.nome,
        segmento: data.segmento,
        ano: data.ano,
        turma: data.turma,
        periodo: data.periodo
      };

      console.log('✅ Turma adicionada:', turmaFormatada);
      return turmaFormatada;
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
          nome: turma.nome,
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

      console.log('✅ Turma atualizada:', turma.id);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      return false;
    }
  }

  static async removerTurma(id: number): Promise<boolean> {
    try {
      // Primeiro, remover horários relacionados
      await supabase
        .from('horarios')
        .delete()
        .eq('turma_id', id);

      // Depois, remover a turma
      const { error } = await supabase
        .from('turmas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover turma:', error);
        return false;
      }

      console.log('✅ Turma removida:', id);
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
        .select('*')
        .order('dia_semana')
        .order('aula');

      if (error) {
        console.error('Erro ao obter horários:', error);
        return [];
      }

      // Converter de snake_case para camelCase
      return (data || []).map(horario => ({
        id: horario.id,
        disciplinaId: horario.disciplina_id,
        professorId: horario.professor_id,
        turmaId: horario.turma_id,
        diaSemana: horario.dia_semana,
        aula: horario.aula
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
          disciplina_id: horario.disciplinaId,
          professor_id: horario.professorId,
          turma_id: horario.turmaId,
          dia_semana: horario.diaSemana,
          aula: horario.aula
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar horário:', error);
        return null;
      }

      // Converter de snake_case para camelCase
      const horarioFormatado: Horario = {
        id: data.id,
        disciplinaId: data.disciplina_id,
        professorId: data.professor_id,
        turmaId: data.turma_id,
        diaSemana: data.dia_semana,
        aula: data.aula
      };

      console.log('✅ Horário adicionado:', horarioFormatado);
      return horarioFormatado;
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
          disciplina_id: horario.disciplinaId,
          professor_id: horario.professorId,
          turma_id: horario.turmaId,
          dia_semana: horario.diaSemana,
          aula: horario.aula
        })
        .eq('id', horario.id);

      if (error) {
        console.error('Erro ao atualizar horário:', error);
        return false;
      }

      console.log('✅ Horário atualizado:', horario.id);
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

      console.log('✅ Horário removido:', id);
      return true;
    } catch (error) {
      console.error('Erro ao remover horário:', error);
      return false;
    }
  }

  static async moverHorario(horarioId: number, novoDia: number, novaAula: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('horarios')
        .update({
          dia_semana: novoDia,
          aula: novaAula
        })
        .eq('id', horarioId);

      if (error) {
        console.error('Erro ao mover horário:', error);
        return false;
      }

      console.log('✅ Horário movido:', horarioId);
      return true;
    } catch (error) {
      console.error('Erro ao mover horário:', error);
      return false;
    }
  }

  // ========== CARREGAMENTO COMPLETO ==========
  static async carregarEstadoCompleto(): Promise<EstadoSistema> {
    try {
      console.log('🔄 Carregando estado completo do Supabase...');

      const [disciplinas, professores, turmas, horarios] = await Promise.all([
        this.obterDisciplinas(),
        this.obterProfessores(),
        this.obterTurmas(),
        this.obterHorarios()
      ]);

      const estado: EstadoSistema = {
        disciplinas,
        professores,
        turmas,
        horarios,
        conflitos: [] // Será calculado pelo ConflitosService
      };

      console.log('✅ Estado carregado do Supabase:', {
        disciplinas: disciplinas.length,
        professores: professores.length,
        turmas: turmas.length,
        horarios: horarios.length
      });

      return estado;
    } catch (error) {
      console.error('❌ Erro ao carregar estado do Supabase:', error);
      return {
        disciplinas: [],
        professores: [],
        turmas: [],
        horarios: [],
        conflitos: []
      };
    }
  }

  // ========== TESTE DE CONEXÃO ==========
  static async testarConexao(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('disciplinas')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Erro ao testar conexão:', error);
        return false;
      }

      console.log('✅ Conexão com Supabase estabelecida');
      return true;
    } catch (error) {
      console.error('❌ Falha na conexão com Supabase:', error);
      return false;
    }
  }

  // ========== MIGRAÇÃO DO LOCALSTORAGE ==========
  static async migrarDadosLocalStorage(): Promise<boolean> {
    try {
      console.log('🔄 Verificando migração do localStorage...');

      // Verificar se há dados no localStorage
      const dadosLocais = localStorage.getItem('sistemaGradeHorarios');
      if (!dadosLocais) {
        console.log('📄 Nenhum dado encontrado no localStorage para migrar');
        return true;
      }

      const estado = JSON.parse(dadosLocais) as EstadoSistema;
      console.log('📦 Dados encontrados no localStorage:', {
        disciplinas: estado.disciplinas?.length || 0,
        professores: estado.professores?.length || 0,
        turmas: estado.turmas?.length || 0,
        horarios: estado.horarios?.length || 0
      });

      // Verificar se o Supabase já tem dados
      const dadosExistentes = await this.carregarEstadoCompleto();
      const temDados = dadosExistentes.disciplinas.length > 0 || 
                      dadosExistentes.professores.length > 0 || 
                      dadosExistentes.turmas.length > 0 || 
                      dadosExistentes.horarios.length > 0;

      if (temDados) {
        console.log('✅ Supabase já contém dados. Migração não necessária.');
        return true;
      }

      console.log('🚀 Iniciando migração para Supabase...');

      // Migrar disciplinas
      if (estado.disciplinas?.length > 0) {
        for (const disciplina of estado.disciplinas) {
          await this.adicionarDisciplina({
            nome: disciplina.nome,
            cor: disciplina.cor
          });
        }
      }

      // Migrar professores
      if (estado.professores?.length > 0) {
        for (const professor of estado.professores) {
          await this.adicionarProfessor({
            nome: professor.nome,
            disciplinaIds: professor.disciplinaIds,
            disponibilidade: professor.disponibilidade
          });
        }
      }

      // Migrar turmas
      if (estado.turmas?.length > 0) {
        for (const turma of estado.turmas) {
          await this.adicionarTurma({
            nome: turma.nome,
            segmento: turma.segmento,
            ano: turma.ano,
            turma: turma.turma,
            periodo: turma.periodo
          });
        }
      }

      // Migrar horários
      if (estado.horarios?.length > 0) {
        for (const horario of estado.horarios) {
          await this.adicionarHorario({
            disciplinaId: horario.disciplinaId,
            professorId: horario.professorId,
            turmaId: horario.turmaId,
            diaSemana: horario.diaSemana,
            aula: horario.aula
          });
        }
      }

      console.log('✅ Migração concluída com sucesso!');
      console.log('🗑️ Limpando localStorage...');
      
      // Fazer backup antes de limpar
      localStorage.setItem('sistemaGradeHorarios_backup', dadosLocais);
      localStorage.removeItem('sistemaGradeHorarios');
      
      return true;
    } catch (error) {
      console.error('❌ Erro durante migração:', error);
      return false;
    }
  }
}