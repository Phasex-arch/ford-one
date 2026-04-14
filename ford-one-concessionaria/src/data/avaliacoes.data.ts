/**
 * @file avaliacoes.data.ts
 * @description Dados mockados das avaliações de satisfação de clientes.
 * 5 avaliações com nota (1–5), texto, data e detalhes do atendimento.
 * Usado no módulo de Avaliação para exibir NPS e cards de feedback.
 *
 * Em produção: substituir por chamada GET /api/avaliacoes.
 */

import type { Avaliacao } from '../types/global.types';

export const AVALIACOES: Avaliacao[] = [
  { c:'Carlos Eduardo Mendes', nota:5, data:'15/04/2026', txt:'Excelente atendimento! O consultor foi muito atencioso e o serviço foi entregue antes do prazo. Com certeza voltarei.',     detalhe:'Serviço: Revisão 10.000 km · Veículo: Bronco Sport 2024 · Consultor: Ricardo Costa'   },
  { c:'Ana Paula Rodrigues',   nota:5, data:'10/04/2026', txt:'Muito satisfeita com a revisão. Fui informada de tudo que seria feito no veículo e o prazo foi respeitado.',              detalhe:'Serviço: Revisão 1.000 km · Veículo: Territory Titanium · Consultor: Patrícia Oliveira' },
  { c:'Roberto Figueiredo',    nota:4, data:'02/04/2026', txt:'Bom atendimento. O tempo de espera foi um pouco maior que o previsto, mas o resultado final foi positivo.',               detalhe:'Serviço: Alinhamento · Veículo: Ranger XLT · Consultor: Lucas Mendes'                  },
  { c:'Juliana Cardoso Santos',nota:5, data:'18/04/2026', txt:'Problema resolvido rapidamente. Adorei o serviço de busca e entrega do veículo!',                                         detalhe:'Serviço: Reparo elétrico · Veículo: Territory SE · Consultor: Ricardo Costa'             },
  { c:'Paulo Ricardo Almeida', nota:5, data:'05/04/2026', txt:'Cliente há 8 anos e continuo fiel. O gerente Ricardo sempre me trata com profissionalismo. Recomendo.',                   detalhe:'Serviço: Revisão 5.000 km · Veículo: Bronco Sport Wildtrak · Consultor: Ricardo Costa'  },
];
