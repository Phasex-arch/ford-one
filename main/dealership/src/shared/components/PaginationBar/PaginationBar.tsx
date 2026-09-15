/**
 * @file PaginationBar.tsx
 * @description Barra de paginação reutilizável (usada por Clientes, Estoque,
 * Leads, Financiamentos, Metas, Serviços e Avaliações).
 * Mostra "Página X de Y · N encontrados" com botões Anterior/Próxima, desabilitados
 * nos limites (hasPrev/hasNext vêm direto do backend, sem recalcular no front).
 * Fica fixa na parte de baixo da viewport (position:fixed) o tempo todo,
 * acima da faixa de rodapé do app (var(--bh)) — não depende de ter conteúdo
 * suficiente pra rolar (sticky não gruda sem espaço de rolagem sobrando).
 * O spacer logo abaixo reserva o espaço na página pra o último card da
 * lista não ficar escondido atrás da barra fixa.
 *
 * Props:
 * - page       → página atual (1-based)
 * - totalPages → total de páginas (0 quando a lista está vazia)
 * - total      → total de registros no backend (não só os da página atual)
 * - hasPrev/hasNext → habilitam os botões de navegação (o botão fica
 *   corretamente desabilitado quando só existe 1 página — não é bug)
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
    <>
      <div className="pagination-spacer" aria-hidden="true" />
      <div className="pagination-bar">
        <span className="pagination-info">
          Página {page} de {totalPages} · {total} encontrado{total === 1 ? '' : 's'}
        </span>
        <button className="icon-btn" disabled={!hasPrev} onClick={() => onChange(page - 1)} title="Página anterior">
          <i className="ph-bold ph-caret-left" />
        </button>
        <button className="icon-btn" disabled={!hasNext} onClick={() => onChange(page + 1)} title="Próxima página">
          <i className="ph-bold ph-caret-right" />
        </button>
      </div>
    </>
  );
};
