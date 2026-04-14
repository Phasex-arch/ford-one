/**
 * @file clientes.data.ts
 * @description Dados mockados da base de clientes da Ford SP Centro.
 * Contém 10 clientes com status (ativo/inativo/potencial), segmento
 * (Premium/VIP/Família/Executivo/Padrão), LTV e iniciais para avatar.
 *
 * Em produção: substituir por chamada GET /api/clientes no clientes.service.ts.
 * A tela e o hook não precisam ser alterados.
 */

import type { Cliente } from '../types/global.types';

export const CLIENTES: Cliente[] = [
  { id:'C001', nome:'Carlos Eduardo Mendes',   tel:'(11) 98245-1122', email:'carlos.mendes@gmail.com',   ult:'15/04/2026', status:'ativo',     v:3, ltv:482300, ini:'CM', seg:'Premium'   },
  { id:'C002', nome:'Ana Paula Rodrigues',      tel:'(11) 91234-5678', email:'ana.rodrigues@email.com',   ult:'10/04/2026', status:'ativo',     v:2, ltv:218700, ini:'AR', seg:'Família'   },
  { id:'C003', nome:'Roberto Figueiredo',       tel:'(11) 99876-5432', email:'roberto.f@empresa.com.br',  ult:'02/04/2026', status:'potencial', v:1, ltv:145000, ini:'RF', seg:'Executivo' },
  { id:'C004', nome:'Fernanda Lima Costa',      tel:'(11) 97654-3210', email:'fernanda.lima@gmail.com',   ult:'28/03/2026', status:'ativo',     v:2, ltv:334500, ini:'FL', seg:'Premium'   },
  { id:'C005', nome:'Marcelo Augusto Pires',    tel:'(11) 95555-0011', email:'marcelo.pires@outlook.com', ult:'20/03/2026', status:'inativo',   v:1, ltv:98200,  ini:'MP', seg:'Padrão'    },
  { id:'C006', nome:'Juliana Cardoso Santos',   tel:'(11) 98800-2244', email:'juliana.cardoso@gmail.com', ult:'18/04/2026', status:'ativo',     v:2, ltv:276800, ini:'JC', seg:'Família'   },
  { id:'C007', nome:'Paulo Ricardo Almeida',    tel:'(11) 96677-8899', email:'paulo.almeida@empresa.com', ult:'05/04/2026', status:'ativo',     v:4, ltv:721400, ini:'PA', seg:'VIP'       },
  { id:'C008', nome:'Cristina Menezes Rocha',   tel:'(11) 93344-5566', email:'cristina.rocha@gmail.com',  ult:'01/04/2026', status:'potencial', v:1, ltv:189000, ini:'CR', seg:'Premium'   },
  { id:'C009', nome:'Alexandre Torres',         tel:'(11) 91122-3344', email:'alex.torres@gmail.com',     ult:'14/04/2026', status:'ativo',     v:2, ltv:312600, ini:'AT', seg:'Executivo' },
  { id:'C010', nome:'Beatriz Oliveira Neves',   tel:'(11) 99988-7766', email:'beatriz.neves@outlook.com', ult:'12/04/2026', status:'ativo',     v:1, ltv:167400, ini:'BO', seg:'Família'   },
];
