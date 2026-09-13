/**
 * @file PaginationBar.tsx
 * @description Barra de paginação reutilizável (usada por Clientes, Estoque e Leads).
 * Mostra "Página X de Y · N encontrados" com botões Anterior/Próxima, desabilitados
 * nos limites (hasPrev/hasNext vêm direto do backend, sem recalcular no front).
 *
 * Props:
 * - page       → página atual (1-based)
 * - totalPages → total de páginas (0 quando a lista está vazia)
 * - total      → total de registros no backend (não só os da página atual)
 * - hasPrev/hasNext → habilitam os botões de navegação
 * - onChange   → callback com a nova página ao clicar Anterior/Próxima
 */

import React from 'react';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  onChange: (page: number) => void;
}

export const PaginationBar: React.FC<Props> = ({ page, totalPages, total, hasPrev, hasNext, onChange }) => {
  if (total === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
      <span style={{ fontSize: 'var(--fs0)', color: 'var(--c-dim)' }}>
        Página {page} de {totalPages} · {total} encontrado{total === 1 ? '' : 's'}
      </span>
      <button className="icon-btn" disabled={!hasPrev} onClick={() => onChange(page - 1)} title="Página anterior">
        <i className="ph-bold ph-caret-left" />
      </button>
      <button className="icon-btn" disabled={!hasNext} onClick={() => onChange(page + 1)} title="Próxima página">
        <i className="ph-bold ph-caret-right" />
      </button>
    </div>
  );
};
