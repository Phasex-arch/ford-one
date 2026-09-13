/**
 * @file tecnico.service.ts
 * @module servicos
 * @description Service de acesso aos técnicos da oficina, usados como opções
 * de designação em Ordens de Serviço e na Agenda. Busca em GET /api/tecnicos
 * — sem dado mockado. Como é só uma lista de seleção (não há tela dedicada de
 * gestão de técnicos), busca tudo em uma página só (limit alto).
 */

import type { Tecnico } from '../../../types/global.types';
import { apiRequest, type PaginatedResponse } from '../../../shared/api/client';

interface TecnicoApi {
  id: string;
  nome: string;
  iniciais: string;
  especialidade: string;
  status: 'LIVRE' | 'OCUPADO' | 'PAUSA' | 'AUSENTE';
}

const toTecnico = (item: TecnicoApi): Tecnico => ({
  id: item.id,
  nome: item.nome,
  ini: item.iniciais,
  esp: item.especialidade,
  status: item.status.toLowerCase() as Tecnico['status'],
});

export async function fetchTecnicos(): Promise<Tecnico[]> {
  const response = await apiRequest<PaginatedResponse<TecnicoApi>>('/tecnicos?page=1&limit=100');
  return response.data.map(toTecnico);
}
