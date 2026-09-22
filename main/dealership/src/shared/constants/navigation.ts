/**
 * @file navigation.ts
 * @description Definição estática da estrutura de navegação da sidebar.
 * Exporta NAV_SECTIONS: array de seções, cada uma com label opcional e itens.
 * Cada item contém: id (ModuleId), label (texto exibido) e icon (classe Phosphor).
 *
 * Esta constante é consumida por AppSidebar para renderizar os itens de menu.
 * Ao adicionar um novo módulo, basta incluir aqui e criar a tela em modules/.
 *
 * Estrutura de seções:
 * 1. Sem label    → Dashboard, Clientes, Histórico, Estoque, Leads
 * 2. Operações    → Agenda, Serviços, Metas, Financiamentos
 * 3. Análise      → Receita, Avaliação, Desempenho, Relatórios
 * 4. Sem label    → Configurações
 */

import type { ModuleId } from '../../types/global.types';

type Role = 'ADMIN' | 'GERENTE' | 'FUNCIONARIO';

/**
 * roles: quando ausente, o item é visível pra qualquer papel autenticado.
 * Receita e Desempenho ficam restritos a ADMIN/GERENTE — espelha o RBAC do
 * backend (`/api/dashboard/receita` e `/api/dashboard/desempenho`), que
 * expõe receita da loja e conversão individual por consultor.
 */
export interface NavItem { id: ModuleId; label: string; icon: string; roles?: Role[]; }
export interface NavSection { label?: string; items: NavItem[]; }

export const NAV_SECTIONS: NavSection[] = [
  { items: [
    { id:'dashboard',     label:'Dashboard',         icon:'ph-squares-four'           },
    { id:'clientes',      label:'Clientes',           icon:'ph-users'                  },
    { id:'historico',     label:'Histórico',          icon:'ph-clock-counter-clockwise'},
    { id:'estoque',       label:'Estoque',            icon:'ph-car'                    },
    { id:'leads',         label:'Leads Inteligentes', icon:'ph-lightning'              },
  ]},
  { label:'Operações', items: [
    { id:'agenda',         label:'Agenda',            icon:'ph-calendar-dots' },
    { id:'servicos',       label:'Serviços',          icon:'ph-wrench'        },
    { id:'metas',          label:'Metas',             icon:'ph-target'        },
    { id:'financiamentos', label:'Financiamentos',    icon:'ph-credit-card'   },
  ]},
  { label:'Análise', items: [
    { id:'receita',     label:'Receita',     icon:'ph-currency-dollar', roles:['ADMIN','GERENTE'] },
    { id:'avaliacao',   label:'Avaliação',   icon:'ph-star'            },
    { id:'desempenho',  label:'Desempenho',  icon:'ph-chart-bar',      roles:['ADMIN','GERENTE'] },
    { id:'relatorios',  label:'Relatórios',  icon:'ph-file-text'       },
  ]},
  { items: [
    { id:'config', label:'Configurações', icon:'ph-sliders' },
  ]},
];
