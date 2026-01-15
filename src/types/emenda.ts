export type TipoConcedente = 'parlamentar' | 'comissao' | 'bancada' | 'outro';

export type StatusEmenda = 'pendente' | 'aprovado' | 'em_execucao' | 'concluido' | 'cancelado';

export type TipoRecebedor = 'administracao_publica' | 'entidade_sem_fins_lucrativos' | 'consorcio_publico' | 'pessoa_juridica_privada' | 'outro';

export interface Emenda {
  id: string;
  numero: string;
  concedente: {
    tipo: TipoConcedente;
    nome: string;
  };
  recebedor: {
    tipo: TipoRecebedor;
    nome: string;
    cnpj: string;
  };
  municipio: string;
  estado: string;
  dataDisponibilizacao: string;
  gestorResponsavel: string;
  objeto: string;
  grupoNaturezaDespesa: string;
  valor: number;
  valorExecutado: number;
  banco: string;
  contaCorrente: string;
  anuenciaPreviaSUS: boolean | null;
  status: StatusEmenda;
  planoTrabalho?: PlanoTrabalho;
  createdAt: string;
  updatedAt: string;
}

export interface PlanoTrabalho {
  id: string;
  emendaId: string;
  objeto: string;
  finalidade: string;
  estimativaRecursos: number;
  cronograma: CronogramaItem[];
  documentos: Documento[];
}

export interface CronogramaItem {
  id: string;
  etapa: string;
  dataInicio: string;
  dataFim: string;
  percentualConclusao: number;
}

export interface Documento {
  id: string;
  nome: string;
  tipo: string;
  url: string;
  dataUpload: string;
}

export interface DashboardStats {
  totalEmendas: number;
  valorTotal: number;
  valorExecutado: number;
  emendasPendentes: number;
  emendasAprovadas: number;
  emendasEmExecucao: number;
  emendasConcluidas: number;
}
