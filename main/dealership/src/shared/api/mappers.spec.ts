/**
 * @file mappers.spec.ts
 * @description Testes dos mapeadores de contrato.
 *
 * Usa payloads iguais aos do seed do backend (prisma/seed.ts) para travar o que
 * já quebrou a UI uma vez: nome de campo (telefone→tel), enum em caixa alta
 * (ATIVO→ativo, usado como classe CSS), segmento sem acento (Familia→Família),
 * codigo virando `id` (e o UUID preservado em `uuid`).
 *
 * Executar: npm test
 */

import { it } from 'vitest';
import assert from 'node:assert/strict';
import {
  toCliente, toEstoque, toLead,
  toServico, statusDaSituacao, toMeta, toFinanciamento, toAvaliacao, toTecnico,
} from './mappers';

it('traduz os 8 contratos do backend para os tipos de tela', () => {
  const cliente = toCliente({
    id: '8f1c2b3d-0000-4000-8000-000000000001',
    codigo: 'C002',
    nome: 'Ana Paula Rodrigues',
    telefone: '(11) 91234-5678',
    email: 'ana.rodrigues@email.com',
    ultimaVisita: '2026-04-10T00:00:00.000Z',
    status: 'ATIVO',
    veiculosCount: 2,
    ltv: 218700,
    iniciais: 'AR',
    segmento: 'Familia',
  });

  assert.equal(cliente.id, 'C002', 'id deve carregar o codigo exibido na UI');
  assert.equal(cliente.uuid, '8f1c2b3d-0000-4000-8000-000000000001', 'uuid do backend preservado');
  assert.equal(cliente.tel, '(11) 91234-5678', 'telefone → tel');
  assert.equal(cliente.status, 'ativo', 'enum minúsculo (vira classe CSS .pill)');
  assert.equal(cliente.seg, 'Família', 'segmento do seed sem acento é normalizado');
  assert.equal(cliente.v, 2, 'veiculosCount → v');
  assert.match(cliente.ult, /^\d{2}\/\d{2}\/\d{4}$/, 'ultimaVisita ISO → dd/mm/aaaa');

  // Campos opcionais ausentes não podem virar undefined na tela.
  const semVisita = toCliente({
    id: 'u', codigo: 'C999', nome: 'Novo Cliente', telefone: '1', email: 'a@b.c',
    ultimaVisita: null, status: 'POTENCIAL', veiculosCount: 0, ltv: 0,
    iniciais: 'NC', segmento: 'Premium',
  } as never);
  assert.equal(semVisita.ult, '—', 'sem última visita exibe travessão');
  assert.equal(semVisita.seg, 'Premium', 'segmento já acentuado passa direto');

  const estoque = toEstoque({
    id: 'e-uuid', codigo: 'E006', modelo: 'Ford Mustang GT',
    versao: '5.0 V8 Fastback', ano: '2024', motor: '5.0 V8 450 cv',
    transmissao: 'Manual 6 vel.', condicao: 'SEMINOVO', status: 'Disponivel',
    preco: 389900, segmento: 'SEDAN', cor: 'Azul Grabber', imagem: null,
    quantidade: 1, km: '18.400 km', opcionais: ['Pacote Pony'],
  });

  assert.equal(estoque.id, 'E006');
  assert.equal(estoque.cond, 'seminovo', 'condicao → cond minúsculo (filtro da tela)');
  assert.equal(estoque.seg, 'sedan', 'segmento → seg minúsculo (filtro da tela)');
  assert.equal(estoque.trans, 'Manual 6 vel.', 'transmissao → trans');
  assert.equal(estoque.estq, 1, 'quantidade → estq');
  assert.deepEqual(estoque.ops, ['Pacote Pony'], 'opcionais → ops');

  // HATCH/OUTRO existem no enum do backend e não podem sumir do grid.
  assert.equal(toEstoque({ ...estoque, segmento: 'HATCH' } as never).seg, 'hatch');

  const lead = toLead({
    id: 'l-uuid', codigo: 'L001', clienteNome: 'Carlos Silva', iniciais: 'CS',
    veiculoInteresse: 'Ford Ranger Storm 2026',
    necessidade: 'Upgrade de picape', urgencia: 'URGENTE',
    valorEstimado: 299900, telefone: '(11) 97788-4411', insight: null,
  });

  assert.equal(lead.id, 'L001');
  assert.equal(lead.cli, 'Carlos Silva', 'clienteNome → cli');
  assert.equal(lead.urg, 'urgente', 'urgencia → urg minúsculo (classe .lead-card)');
  assert.equal(lead.val, 299900, 'valorEstimado → val');
  assert.equal(lead.ins, '', 'insight nulo vira string vazia, não undefined');

  // ── Ordens de serviço: o status vira a aba da tela ─────────────────────────
  const os = toServico({
    id: 'os-uuid', numero: '#4813', cliente: 'Fernanda Costa', veiculo: 'Maverick 2024',
    tipo: 'Instalacao de acessorios', tecnico: 'Diego Ferreira', prazo: 'Ontem',
    prioridade: 'OK', valor: 'R$ 3.800', status: 'CONCLUIDO',
  });

  assert.equal(os.num, '#4813', 'numero → num');
  assert.equal(os.c, 'Fernanda Costa', 'cliente → c');
  assert.equal(os.v, 'Maverick 2024', 'veiculo → v');
  assert.equal(os.t, 'Instalacao de acessorios', 'tipo → t');
  assert.equal(os.tech, 'Diego Ferreira', 'tecnico → tech');
  assert.equal(os.pc, 'ok', 'prioridade → pc minúsculo (classe CSS)');
  assert.equal(os.situacao, 'concluidos', 'CONCLUIDO cai na aba concluidos');
  assert.equal(toServico({ ...os, status: 'ANDAMENTO' } as never).situacao, 'andamento');
  assert.equal(toServico({ ...os, status: 'CANCELADO' } as never).situacao, 'cancelados');

  // statusDaSituacao tem que ser o inverso exato — é o que o PATCH envia.
  for (const [situacao, status] of [
    ['previstos', 'PREVISTO'], ['andamento', 'ANDAMENTO'],
    ['concluidos', 'CONCLUIDO'], ['cancelados', 'CANCELADO'],
  ] as const) {
    assert.equal(statusDaSituacao(situacao), status, `situação ${situacao} → status ${status}`);
  }

  // ── Metas ──────────────────────────────────────────────────────────────────
  const meta = toMeta({
    id: 'm-uuid', codigo: 'M006', titulo: 'Taxa de Conversao', periodo: 'Abril/2026',
    indicador: 'conv', atual: 34.2, alvo: 32, unidade: '%',
    responsavel: 'Ricardo Costa', lowerIsBetter: false,
  });
  assert.equal(meta.id, 'M006');
  assert.equal(meta.indicador, 'conv');
  assert.equal(meta.atual, 34.2, 'decimal preservado (a barra de progresso depende dele)');
  assert.equal(meta.lowerIsBetter, false);

  // ── Financiamentos ─────────────────────────────────────────────────────────
  const fin = toFinanciamento({
    id: 'f-uuid', codigo: 'F005', clienteNome: 'Alexandre Torres', iniciais: 'AT',
    veiculo: 'Ranger XLS 2026', valor: 219900, entrada: 44000, prazo: 36,
    taxa: 1.49, parcela: 6218, status: 'APROVADO', data: 'Mar 2026',
  });
  assert.equal(fin.id, 'F005');
  assert.equal(fin.cli, 'Alexandre Torres', 'clienteNome → cli');
  assert.equal(fin.status, 'aprovado', 'status → minúsculo (pill e filtro da tela)');
  assert.equal(fin.taxa, 1.49, 'taxa decimal preservada');

  // ── Avaliações ─────────────────────────────────────────────────────────────
  const av = toAvaliacao({
    id: 'a-uuid', cliente: 'Carlos Eduardo Mendes', nota: 5, data: '15/04/2026',
    texto: 'Excelente atendimento!', detalhe: null,
  });
  assert.equal(av.c, 'Carlos Eduardo Mendes', 'cliente → c');
  assert.equal(av.txt, 'Excelente atendimento!', 'texto → txt');
  assert.equal(av.detalhe, '', 'detalhe nulo vira string vazia');

  // ── Técnicos ───────────────────────────────────────────────────────────────
  const tec = toTecnico({
    id: 't-uuid', nome: 'Andre Souza', iniciais: 'AS',
    especialidade: 'Revisoes programadas', status: 'OCUPADO',
  });
  assert.equal(tec.ini, 'AS', 'iniciais → ini');
  assert.equal(tec.esp, 'Revisoes programadas', 'especialidade → esp');
  assert.equal(tec.status, 'ocupado', 'status → minúsculo (classe .tec-dot)');
  // AUSENTE existe no enum do backend e não pode virar undefined na bolinha.
  assert.equal(toTecnico({ ...tec, status: 'AUSENTE' } as never).status, 'ausente');

});
