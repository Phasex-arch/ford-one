/**
 * @file types.ts
 * @description Tipos TypeScript que espelham os DTOs da API Ford Brasil.
 * Sao usados apenas dentro de src/shared/api/* — os hooks e as telas continuam
 * consumindo os tipos do front (src/types/global.types.ts) via adapters.
 */

export type ApiRole = 'ADMIN' | 'GERENTE' | 'FUNCIONARIO';

export type ApiClienteStatus = 'ATIVO' | 'INATIVO' | 'POTENCIAL';
export type ApiLeadUrgencia = 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAIXA';
export type ApiEstoqueCondicao = 'NOVO' | 'SEMINOVO';
export type ApiEstoqueSegmento = 'SUV' | 'PICAPE' | 'SEDAN' | 'HATCH' | 'OUTRO';
export type ApiFinanciamentoStatus = 'APROVADO' | 'ANALISE' | 'PENDENTE' | 'REPROVADO';
export type ApiServicoStatus = 'PREVISTO' | 'ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
export type ApiServicoPrioridade = 'OK' | 'RISCO' | 'ATRASADO';
export type ApiTecnicoStatus = 'LIVRE' | 'OCUPADO' | 'PAUSA' | 'AUSENTE';

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthUserDto {
  id: string;
  nome: string;
  email: string;
  role: ApiRole;
}

export interface AuthResponseDto {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUserDto;
}

export interface ClienteApiDto {
  id: string;
  codigo: string;
  nome: string;
  telefone: string;
  email: string;
  ultimaVisita?: string;
  status: ApiClienteStatus;
  veiculosCount: number;
  ltv: number;
  iniciais: string;
  segmento: string;
}

export interface EstoqueApiDto {
  id: string;
  codigo: string;
  modelo: string;
  versao: string;
  ano: string;
  motor: string;
  transmissao: string;
  condicao: ApiEstoqueCondicao;
  status: string;
  preco: number;
  segmento: ApiEstoqueSegmento;
  cor: string;
  imagem?: string | null;
  quantidade: number;
  km?: string | null;
  opcionais?: string[];
}

export interface LeadApiDto {
  id: string;
  codigo: string;
  clienteNome: string;
  iniciais: string;
  veiculoInteresse: string;
  necessidade: string;
  urgencia: ApiLeadUrgencia;
  valorEstimado: number;
  telefone: string;
  insight?: string;
}

export interface FinanciamentoApiDto {
  id: string;
  codigo: string;
  clienteNome: string;
  iniciais: string;
  veiculo: string;
  valor: number;
  entrada: number;
  prazo: number;
  taxa: number;
  parcela: number;
  status: ApiFinanciamentoStatus;
  data: string;
}

export interface ServicoApiDto {
  id: string;
  numero: string;
  cliente: string;
  veiculo: string;
  tipo: string;
  tecnico: string;
  prazo: string;
  prioridade: ApiServicoPrioridade;
  valor: string;
  status: ApiServicoStatus;
}

export interface TecnicoApiDto {
  id: string;
  nome: string;
  iniciais: string;
  especialidade: string;
  status: ApiTecnicoStatus;
}

export interface MetaApiDto {
  id: string;
  codigo: string;
  titulo: string;
  periodo: string;
  indicador: string;
  atual: number;
  alvo: number;
  unidade: string;
  responsavel: string;
  lowerIsBetter: boolean;
}

export interface AvaliacaoApiDto {
  id: string;
  cliente: string;
  nota: number;
  data: string;
  texto: string;
  detalhe?: string;
}

export interface AvaliacaoStatsDto {
  total: number;
  media: number;
  notaPorEstrela?: Record<string, number>;
  [key: string]: unknown;
}

export interface ColaboradorApiDto {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  registro: string;
  cargo: string;
  role: ApiRole;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSnapshotDto {
  periodo?: string;
  leads?: number;
  agendamentos?: number;
  receita?: number;
  conversao?: number;
  sla?: number;
  nota?: number;
  estoque?: number;
  [key: string]: unknown;
}
