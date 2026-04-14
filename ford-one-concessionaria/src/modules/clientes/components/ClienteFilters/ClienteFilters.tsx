/**
 * @file ClienteFilters.tsx
 * @module clientes
 * @description Barra de filtros da tela de Clientes.
 * Renderiza três controles: busca por texto, filtro de status e ordenação.
 * Totalmente controlado — não mantém estado interno, apenas chama onChange.
 *
 * Props:
 * - filters   → objeto ClienteFilters com valores atuais
 * - onChange  → callback tipado por chave para atualizar filtros no hook
 */

import React from 'react';
import type { ClienteFilters } from '../../services/clientes.service';

interface Props { filters: ClienteFilters; onChange: <K extends keyof ClienteFilters>(k: K, v: ClienteFilters[K]) => void; }

export const ClienteFiltersBar: React.FC<Props> = ({ filters, onChange }) => (
  <div className="filter-bar">
    <div className="srch-field">
      <i className="ph-bold ph-magnifying-glass" />
      <input type="text" placeholder="Buscar cliente..." id="clientSearch"
        value={filters.query} onChange={e => onChange('query', e.target.value)} />
    </div>
    <select id="clientStatus" value={filters.status} onChange={e => onChange('status', e.target.value as ClienteFilters['status'])}>
      <option value="">Todos os status</option>
      <option value="ativo">Ativo</option>
      <option value="inativo">Inativo</option>
      <option value="potencial">Potencial</option>
    </select>
    <select id="clientOrder" value={filters.order} onChange={e => onChange('order', e.target.value as ClienteFilters['order'])}>
      <option value="nome">Nome A–Z</option>
      <option value="ltv">Maior LTV</option>
      <option value="ult">Último atendimento</option>
    </select>
  </div>
);
