import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboard } from './useDashboard';
import { apiRequest } from '../../../shared/api/client';

vi.mock('../../../shared/api/client', () => ({
  apiRequest: vi.fn(),
}));

/**
 * O ponto crítico aqui não é o fetch em si (isso o backend já cobre em
 * dashboard.service.spec.ts) — é o formatDelta do front nunca inventar uma
 * variação: "Sem histórico" quando o backend manda null, sinal certo, e a
 * lógica invertida do SLA (menor é melhor).
 */
describe('useDashboard — formatação de deltas', () => {
  function mockDashboardResponse(deltas: Record<string, number | null>) {
    vi.mocked(apiRequest).mockResolvedValue({
      kpis: { leads: 10, agendamentos: 5, receita: 1000, conversao: 20, sla: 4, nota: 4.5, estoque: 30 },
      deltas,
      alertas: { slaRisco: null, estoqueBaixo: null, leadPrioritario: null, metaAtingida: null },
    });
  }

  it('mostra "Sem histórico" (não 0% nem infinito) quando o backend não manda base de comparação', async () => {
    mockDashboardResponse({
      leads: null, agendamentos: null, receita: null, conversao: null, sla: null, nota: null, estoque: null,
    });

    const { result } = renderHook(() => useDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const leads = result.current.kpis.find((k) => k.key === 'leads')!;
    expect(leads.delta).toBe('Sem histórico');
    expect(leads.cls).toBe('neu');
  });

  it('marca uma variação positiva de receita como favorável (cls "pos")', async () => {
    mockDashboardResponse({
      leads: 10, agendamentos: 10, receita: 25, conversao: 5, sla: 10, nota: 0.2, estoque: 10,
    });

    const { result } = renderHook(() => useDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const receita = result.current.kpis.find((k) => k.key === 'receita')!;
    expect(receita.delta).toBe('+25.0%');
    expect(receita.cls).toBe('pos');
  });

  it('inverte a favorabilidade do SLA: uma queda no tempo de atendimento é boa, não ruim', async () => {
    mockDashboardResponse({
      leads: 0, agendamentos: 0, receita: 0, conversao: 0, sla: -15, nota: 0, estoque: 0,
    });

    const { result } = renderHook(() => useDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const sla = result.current.kpis.find((k) => k.key === 'sla')!;
    expect(sla.delta).toBe('-15.0%');
    expect(sla.cls).toBe('pos');
  });
});
