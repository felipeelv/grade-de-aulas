import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { EstadoSistema, Disciplina, Professor, Turma, Horario } from '../types';
import { LocalStorageService } from '../services/localStorage';
import { SupabaseServiceExato as SupabaseService } from '../services/supabaseServiceExato';
import { ConflitosService } from '../services/conflitosService';
import { useNotificacao } from '../components/Notificacoes/NotificacaoProvider';
import { supabase } from '../lib/supabase';

type AcaoSistema =
  | { tipo: 'CARREGAR_DADOS'; payload: EstadoSistema }
  | { tipo: 'ADICIONAR_DISCIPLINA'; payload: Disciplina }
  | { tipo: 'ATUALIZAR_DISCIPLINA'; payload: Disciplina }
  | { tipo: 'REMOVER_DISCIPLINA'; payload: number }
  | { tipo: 'ADICIONAR_PROFESSOR'; payload: Professor }
  | { tipo: 'ATUALIZAR_PROFESSOR'; payload: Professor }
  | { tipo: 'REMOVER_PROFESSOR'; payload: number }
  | { tipo: 'ADICIONAR_TURMA'; payload: Turma }
  | { tipo: 'ATUALIZAR_TURMA'; payload: Turma }
  | { tipo: 'REMOVER_TURMA'; payload: number }
  | { tipo: 'ADICIONAR_HORARIO'; payload: Horario }
  | { tipo: 'ATUALIZAR_HORARIO'; payload: Horario }
  | { tipo: 'REMOVER_HORARIO'; payload: number }
  | { tipo: 'MOVER_HORARIO'; payload: { horarioId: number; novoDia: number; novaAula: number } }
  | { tipo: 'ATUALIZAR_CONFLITOS' };

interface ContextoSistema {
  estado: EstadoSistema;
  dispatch: React.Dispatch<AcaoSistema>;
  carregando: boolean;
  conectado: boolean;
  // Funciones auxiliares
  adicionarDisciplina: (disciplina: Omit<Disciplina, 'id'>) => Promise<void>;
  atualizarDisciplina: (disciplina: Disciplina) => Promise<void>;
  removerDisciplina: (id: number) => Promise<void>;
  adicionarProfessor: (professor: Omit<Professor, 'id'>) => Promise<void>;
  atualizarProfessor: (professor: Professor) => Promise<void>;
  removerProfessor: (id: number) => Promise<void>;
  adicionarTurma: (turma: Omit<Turma, 'id'>) => Promise<void>;
  atualizarTurma: (turma: Turma) => Promise<void>;
  removerTurma: (id: number) => Promise<void>;
  adicionarHorario: (horario: Omit<Horario, 'id'>) => Promise<void>;
  atualizarHorario: (horario: Horario) => Promise<void>;
  removerHorario: (id: number) => Promise<void>;
  moverHorario: (horarioId: number, novoDia: number, novaAula: number) => Promise<void>;
  validarHorario: (horario: Omit<Horario, 'id'>) => { valido: boolean; motivo?: string };
  obterDisciplinaPorId: (id: number) => Disciplina | undefined;
  obterProfessorPorId: (id: number) => Professor | undefined;
  obterTurmaPorId: (id: number) => Turma | undefined;
}

const SistemaContext = createContext<ContextoSistema | undefined>(undefined);

function sistemaReducer(estado: EstadoSistema, acao: AcaoSistema): EstadoSistema {
  switch (acao.tipo) {
    case 'CARREGAR_DADOS':
      return acao.payload;
      
    case 'ADICIONAR_DISCIPLINA':
      return {
        ...estado,
        disciplinas: [...estado.disciplinas, acao.payload]
      };
      
    case 'ATUALIZAR_DISCIPLINA':
      return {
        ...estado,
        disciplinas: estado.disciplinas.map(d => 
          d.id === acao.payload.id ? acao.payload : d
        )
      };
      
    case 'REMOVER_DISCIPLINA':
      return {
        ...estado,
        disciplinas: estado.disciplinas.filter(d => d.id !== acao.payload),
        professores: estado.professores.filter(p => !p.disciplinaIds.includes(acao.payload)),
        horarios: estado.horarios.filter(h => h.disciplinaId !== acao.payload)
      };
      
    case 'ADICIONAR_PROFESSOR':
      return {
        ...estado,
        professores: [...estado.professores, acao.payload]
      };
      
    case 'ATUALIZAR_PROFESSOR':
      return {
        ...estado,
        professores: estado.professores.map(p => 
          p.id === acao.payload.id ? acao.payload : p
        )
      };
      
    case 'REMOVER_PROFESSOR':
      return {
        ...estado,
        professores: estado.professores.filter(p => p.id !== acao.payload),
        horarios: estado.horarios.filter(h => h.professorId !== acao.payload)
      };
      
    case 'ADICIONAR_TURMA':
      return {
        ...estado,
        turmas: [...estado.turmas, acao.payload]
      };
      
    case 'ATUALIZAR_TURMA':
      return {
        ...estado,
        turmas: estado.turmas.map(t => 
          t.id === acao.payload.id ? acao.payload : t
        )
      };
      
    case 'REMOVER_TURMA':
      return {
        ...estado,
        turmas: estado.turmas.filter(t => t.id !== acao.payload),
        horarios: estado.horarios.filter(h => h.turmaId !== acao.payload)
      };
      
    case 'ADICIONAR_HORARIO':
      return {
        ...estado,
        horarios: [...estado.horarios, acao.payload]
      };
      
    case 'ATUALIZAR_HORARIO':
      return {
        ...estado,
        horarios: estado.horarios.map(h => 
          h.id === acao.payload.id ? acao.payload : h
        )
      };
      
    case 'REMOVER_HORARIO':
      return {
        ...estado,
        horarios: estado.horarios.filter(h => h.id !== acao.payload)
      };
      
    case 'MOVER_HORARIO': {
      const { horarioId, novoDia, novaAula } = acao.payload;
      return {
        ...estado,
        horarios: estado.horarios.map(h => 
          h.id === horarioId ? { ...h, diaSemana: novoDia, aula: novaAula } : h
        )
      };
    }
    
    case 'ATUALIZAR_CONFLITOS': {
      const conflitos = ConflitosService.detectarConflitos(
        estado.horarios,
        estado.professores,
        estado.turmas,
        estado.disciplinas
      );
      return {
        ...estado,
        conflitos
      };
    }
    
    default:
      return estado;
  }
}

export function SistemaProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(sistemaReducer, {
    disciplinas: [],
    professores: [],
    turmas: [],
    horarios: [],
    conflitos: []
  });
  
  const [carregando, setCarregando] = React.useState(true);
  const [conectado, setConectado] = React.useState(false);

  // Carrega dados do Supabase na inicialização
  useEffect(() => {
    const inicializarSistema = async () => {
      try {
        setCarregando(true);
        console.log('🚀 Inicializando sistema colaborativo...');
        
        // Verificar conexão usando serviço adaptado
        const conexaoOk = await SupabaseService.testarConexao();
        setConectado(conexaoOk);
        
        if (!conexaoOk) {
          console.warn('⚠️ Fallback para localStorage por problemas de conexão');
          LocalStorageService.testarLocalStorage();
          const dadosCarregados = LocalStorageService.carregarEstado();
          dispatch({ tipo: 'CARREGAR_DADOS', payload: dadosCarregados });
          return;
        }
        
        // Migrar dados do localStorage se necessário
        await SupabaseService.migrarDadosLocalStorage();
        
        // Carregar dados do Supabase
        const dadosCarregados = await SupabaseService.carregarEstadoCompleto();
        dispatch({ tipo: 'CARREGAR_DADOS', payload: dadosCarregados });
        
        console.log('✅ Sistema colaborativo inicializado:', {
          disciplinas: dadosCarregados.disciplinas.length,
          professores: dadosCarregados.professores.length,
          turmas: dadosCarregados.turmas.length,
          horarios: dadosCarregados.horarios.length
        });
      } catch (error) {
        console.error('❌ Erro ao inicializar sistema:', error);
        setConectado(false);
        
        // Fallback para localStorage
        LocalStorageService.testarLocalStorage();
        const dadosCarregados = LocalStorageService.carregarEstado();
        dispatch({ tipo: 'CARREGAR_DADOS', payload: dadosCarregados });
      } finally {
        setCarregando(false);
      }
    };
    
    inicializarSistema();
  }, []);

  // Configurar sincronização em tempo real e atualizar conflitos
  useEffect(() => {
    // Backup no localStorage para modo offline
    if (!carregando) {
      LocalStorageService.salvarEstado(estado);
      dispatch({ tipo: 'ATUALIZAR_CONFLITOS' });
    }
    
    // Configurar sincronização em tempo real apenas se conectado
    if (!conectado || carregando) return;
    
    console.log('📡 Configurando sincronização em tempo real...');
    
    const channels = [
      supabase.channel('disciplinas').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'disciplinas' },
        async () => {
          const novasDisciplinas = await SupabaseService.obterDisciplinas();
          dispatch({ tipo: 'CARREGAR_DADOS', payload: { ...estado, disciplinas: novasDisciplinas } });
        }
      ),
      supabase.channel('professores').on('postgres_changes',
        { event: '*', schema: 'public', table: 'professores' },
        async () => {
          const novosProfessores = await SupabaseService.obterProfessores();
          dispatch({ tipo: 'CARREGAR_DADOS', payload: { ...estado, professores: novosProfessores } });
        }
      ),
      supabase.channel('turmas').on('postgres_changes',
        { event: '*', schema: 'public', table: 'turmas' },
        async () => {
          const novasTurmas = await SupabaseService.obterTurmas();
          dispatch({ tipo: 'CARREGAR_DADOS', payload: { ...estado, turmas: novasTurmas } });
        }
      ),
      supabase.channel('horarios').on('postgres_changes',
        { event: '*', schema: 'public', table: 'horarios' },
        async () => {
          const novosHorarios = await SupabaseService.obterHorarios();
          dispatch({ tipo: 'CARREGAR_DADOS', payload: { ...estado, horarios: novosHorarios } });
        }
      )
    ];
    
    channels.forEach(channel => channel.subscribe());
    
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [estado.disciplinas, estado.professores, estado.turmas, estado.horarios, conectado, carregando]);

  // Funções auxiliares para gerar IDs únicos
  const gerarProximoId = (lista: { id: number }[]) => {
    if (lista.length === 0) return 1;
    return Math.max(...lista.map(item => item.id)) + 1;
  };

  // Funções auxiliares - agora assíncronas para Supabase
  const adicionarDisciplina = async (disciplina: Omit<Disciplina, 'id'>) => {
    if (conectado) {
      const novaDisciplina = await SupabaseService.adicionarDisciplina(disciplina);
      if (novaDisciplina) {
        dispatch({ tipo: 'ADICIONAR_DISCIPLINA', payload: novaDisciplina });
      }
    } else {
      // Fallback para localStorage
      const novaDisciplina: Disciplina = {
        ...disciplina,
        id: gerarProximoId(estado.disciplinas)
      };
      dispatch({ tipo: 'ADICIONAR_DISCIPLINA', payload: novaDisciplina });
    }
  };

  const atualizarDisciplina = async (disciplina: Disciplina) => {
    if (conectado) {
      const sucesso = await SupabaseService.atualizarDisciplina(disciplina);
      if (sucesso) {
        dispatch({ tipo: 'ATUALIZAR_DISCIPLINA', payload: disciplina });
      }
    } else {
      dispatch({ tipo: 'ATUALIZAR_DISCIPLINA', payload: disciplina });
    }
  };

  const removerDisciplina = async (id: number) => {
    if (conectado) {
      const sucesso = await SupabaseService.removerDisciplina(id);
      if (sucesso) {
        dispatch({ tipo: 'REMOVER_DISCIPLINA', payload: id });
      }
    } else {
      dispatch({ tipo: 'REMOVER_DISCIPLINA', payload: id });
    }
  };

  const adicionarProfessor = async (professor: Omit<Professor, 'id'>) => {
    if (conectado) {
      const novoProfessor = await SupabaseService.adicionarProfessor(professor);
      if (novoProfessor) {
        dispatch({ tipo: 'ADICIONAR_PROFESSOR', payload: novoProfessor });
      }
    } else {
      const novoProfessor: Professor = {
        ...professor,
        id: gerarProximoId(estado.professores)
      };
      dispatch({ tipo: 'ADICIONAR_PROFESSOR', payload: novoProfessor });
    }
  };

  const atualizarProfessor = async (professor: Professor) => {
    if (conectado) {
      const sucesso = await SupabaseService.atualizarProfessor(professor);
      if (sucesso) {
        dispatch({ tipo: 'ATUALIZAR_PROFESSOR', payload: professor });
      }
    } else {
      dispatch({ tipo: 'ATUALIZAR_PROFESSOR', payload: professor });
    }
  };

  const removerProfessor = async (id: number) => {
    console.log('🗑️ Removendo professor com ID:', id);
    
    if (conectado) {
      const sucesso = await SupabaseService.removerProfessor(id);
      if (sucesso) {
        dispatch({ tipo: 'REMOVER_PROFESSOR', payload: id });
        console.log('✅ Professor removido do Supabase!');
      }
    } else {
      dispatch({ tipo: 'REMOVER_PROFESSOR', payload: id });
      console.log('✅ Professor removido do localStorage!');
    }
  };

  const adicionarTurma = async (turma: Omit<Turma, 'id'>) => {
    if (conectado) {
      const novaTurma = await SupabaseService.adicionarTurma(turma);
      if (novaTurma) {
        dispatch({ tipo: 'ADICIONAR_TURMA', payload: novaTurma });
      }
    } else {
      const novaTurma: Turma = {
        ...turma,
        id: gerarProximoId(estado.turmas)
      };
      dispatch({ tipo: 'ADICIONAR_TURMA', payload: novaTurma });
    }
  };

  const atualizarTurma = async (turma: Turma) => {
    if (conectado) {
      const sucesso = await SupabaseService.atualizarTurma(turma);
      if (sucesso) {
        dispatch({ tipo: 'ATUALIZAR_TURMA', payload: turma });
      }
    } else {
      dispatch({ tipo: 'ATUALIZAR_TURMA', payload: turma });
    }
  };

  const removerTurma = async (id: number) => {
    if (conectado) {
      const sucesso = await SupabaseService.removerTurma(id);
      if (sucesso) {
        dispatch({ tipo: 'REMOVER_TURMA', payload: id });
      }
    } else {
      dispatch({ tipo: 'REMOVER_TURMA', payload: id });
    }
  };

  const adicionarHorario = async (horario: Omit<Horario, 'id'>) => {
    if (conectado) {
      const novoHorario = await SupabaseService.adicionarHorario(horario);
      if (novoHorario) {
        dispatch({ tipo: 'ADICIONAR_HORARIO', payload: novoHorario });
      }
    } else {
      const novoHorario: Horario = {
        ...horario,
        id: gerarProximoId(estado.horarios)
      };
      dispatch({ tipo: 'ADICIONAR_HORARIO', payload: novoHorario });
    }
  };

  const atualizarHorario = async (horario: Horario) => {
    if (conectado) {
      const sucesso = await SupabaseService.atualizarHorario(horario);
      if (sucesso) {
        dispatch({ tipo: 'ATUALIZAR_HORARIO', payload: horario });
      }
    } else {
      dispatch({ tipo: 'ATUALIZAR_HORARIO', payload: horario });
    }
  };

  const removerHorario = async (id: number) => {
    if (conectado) {
      const sucesso = await SupabaseService.removerHorario(id);
      if (sucesso) {
        dispatch({ tipo: 'REMOVER_HORARIO', payload: id });
      }
    } else {
      dispatch({ tipo: 'REMOVER_HORARIO', payload: id });
    }
  };

  const moverHorario = async (horarioId: number, novoDia: number, novaAula: number) => {
    if (conectado) {
      const sucesso = await SupabaseService.moverHorario(horarioId, novoDia, novaAula);
      if (sucesso) {
        dispatch({ tipo: 'MOVER_HORARIO', payload: { horarioId, novoDia, novaAula } });
      }
    } else {
      dispatch({ tipo: 'MOVER_HORARIO', payload: { horarioId, novoDia, novaAula } });
    }
  };

  const validarHorario = (horario: Omit<Horario, 'id'>) => {
    return ConflitosService.validarHorario(horario, estado.horarios);
  };

  const obterDisciplinaPorId = (id: number) => {
    return estado.disciplinas.find(d => d.id === id);
  };

  const obterProfessorPorId = (id: number) => {
    return estado.professores.find(p => p.id === id);
  };

  const obterTurmaPorId = (id: number) => {
    return estado.turmas.find(t => t.id === id);
  };

  const valorContexto: ContextoSistema = {
    estado,
    dispatch,
    carregando,
    conectado,
    adicionarDisciplina,
    atualizarDisciplina,
    removerDisciplina,
    adicionarProfessor,
    atualizarProfessor,
    removerProfessor,
    adicionarTurma,
    atualizarTurma,
    removerTurma,
    adicionarHorario,
    atualizarHorario,
    removerHorario,
    moverHorario,
    validarHorario,
    obterDisciplinaPorId,
    obterProfessorPorId,
    obterTurmaPorId
  };

  return (
    <SistemaContext.Provider value={valorContexto}>
      {children}
    </SistemaContext.Provider>
  );
}

export function useSistema() {
  const contexto = useContext(SistemaContext);
  if (contexto === undefined) {
    throw new Error('useSistema deve ser usado dentro de SistemaProvider');
  }
  return contexto;
}