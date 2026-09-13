/**
 * @file configuracoes.service.ts
 * @module configuracoes
 * @description Service de acesso às configurações do sistema.
 * Busca/grava em GET|PATCH /api/configuracoes/concessionaria (dados reais da
 * concessionária, singleton) e GET /api/configuracoes/seguranca (status real
 * de auditoria e expiração de sessão, sem toggle nenhum — nada disso é
 * configurável por aqui, só reportado).
 */

import { apiRequest } from '../../../shared/api/client';

export interface Concessionaria {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  updatedAt: string;
}

export interface UpdateConcessionariaInput {
  nome?: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
}

export interface SegurancaStatus {
  auditLogAtivo: boolean;
  jwtExpiresIn: string;
}

export async function fetchConcessionaria(): Promise<Concessionaria> {
  return apiRequest<Concessionaria>('/configuracoes/concessionaria');
}

export async function updateConcessionaria(dados: UpdateConcessionariaInput): Promise<Concessionaria> {
  return apiRequest<Concessionaria>('/configuracoes/concessionaria', {
    method: 'PATCH',
    body: JSON.stringify(dados),
  });
}

export async function fetchSeguranca(): Promise<SegurancaStatus> {
  return apiRequest<SegurancaStatus>('/configuracoes/seguranca');
}
