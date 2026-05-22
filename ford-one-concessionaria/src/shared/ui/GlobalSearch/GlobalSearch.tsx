/**
 * @file GlobalSearch.tsx
 * @description Componente de busca global do header do Ford One.
 * Equivalente React da lógica SIDX + globalSearch do script.js original.
 *
 * Funcionalidades:
 * - Indexa em tempo real: clientes, estoque, leads e módulos principais
 * - Filtra por nome, e-mail ou descrição com mínimo de 2 caracteres
 * - Limita a 7 resultados para não sobrecarregar a UI
 * - Realça o termo pesquisado nos resultados com <mark>
 * - Navega para o módulo correto ao clicar no resultado
 * - Abre modal de detalhe do item via CustomEvent (ford:selectCliente,
 *   ford:openEstoque, ford:openLead) com delay para o módulo montar
 * - Fecha o dropdown ao perder foco (blur com delay de 200ms)
 */

import React, { useState, useRef } from 'react';
import { clientesStore, estoqueStore, leadsStore, useStore } from '../../api/cache';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import type { ModuleId } from '../../../types/global.types';

interface SearchItem { type: string; label: string; sub: string; action: () => void; }

export const GlobalSearch: React.FC = () => {
  const { navigate, logAccess } = useApp();
  const clientes = useStore(clientesStore);
  const estoque = useStore(estoqueStore);
  const leads = useStore(leadsStore);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const buildIndex = (): SearchItem[] => [
    ...clientes.map(c => ({ type:'Cliente', label:c.nome, sub:c.email,
      action: () => { logAccess(c.id); navigate('historico'); setTimeout(() => {
        const ev = new CustomEvent('ford:selectCliente', { detail: c.id });
        window.dispatchEvent(ev);
      }, 120); }
    })),
    ...estoque.map(e => ({ type:'Estoque', label:`${e.modelo} ${e.versao}`, sub:formatCurrency(e.preco),
      action: () => { navigate('estoque'); setTimeout(() => {
        const ev = new CustomEvent('ford:openEstoque', { detail: e.id });
        window.dispatchEvent(ev);
      }, 180); }
    })),
    ...leads.map(l => ({ type:'Lead', label:l.cli, sub:l.nec,
      action: () => { navigate('leads'); setTimeout(() => {
        const ev = new CustomEvent('ford:openLead', { detail: l.id });
        window.dispatchEvent(ev);
      }, 180); }
    })),
    ...(['metas','financiamentos','relatorios'] as ModuleId[]).map(mod => ({
      type: 'Módulo', label: mod.charAt(0).toUpperCase() + mod.slice(1), sub: '',
      action: () => navigate(mod),
    })),
  ];

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (q.length < 2) { setOpen(false); setHits([]); return; }
    const ql = q.toLowerCase();
    const results = buildIndex()
      .filter(x => x.label.toLowerCase().includes(ql) || x.sub.toLowerCase().includes(ql))
      .slice(0, 7);
    setHits(results);
    setOpen(results.length > 0);
  };

  const doSearch = (i: number) => {
    hits[i]?.action();
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const highlight = (text: string) => {
    if (!query) return text;
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(re, '<mark style="background:var(--ford-light);color:var(--ford-vivid);border-radius:2px">$1</mark>');
  };

  return (
    <div className="header-search">
      <div className="search-wrap">
        <i className="ph-bold ph-magnifying-glass srch-icon" />
        <input
          ref={inputRef}
          type="text"
          id="globalSearch"
          placeholder="Pesquisar cliente, veículo, serviço ou lead..."
          autoComplete="off"
          value={query}
          onChange={handleInput}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        <div className={`search-results${open ? ' active' : ''}`} id="searchResults">
          {hits.map((h, i) => (
            <div key={i} className="sri" onClick={() => doSearch(i)}>
              <span className="sri-tag">{h.type}</span>
              <div>
                <strong dangerouslySetInnerHTML={{ __html: highlight(h.label) }} />
                <small>{h.sub}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
