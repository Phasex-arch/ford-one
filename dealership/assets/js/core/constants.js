/**
 * ============================================================
 * CONSTANTS — Dados estáticos e configurações do sistema
 * ============================================================
 */

// Dias da semana e meses
export const DAYS = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
];

export const MONTHS = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
];

// Horários disponíveis para agendamento
export const SLOT_HOURS = [
    '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
];

// Configurações padrão
export const CONFIG = {
    dealership: {
        name: 'Ford São Paulo Centro',
        cnpj: '12.345.678/0001-90',
        code: 'SP-0142',
        manager: 'Ricardo Costa'
    },
    defaults: {
        salesGoal: 28,
        revenueGoal: 1200000,
        slaMax: 4,
        npsMin: 70
    }
};

// Mapeamento de status para cores
export const STATUS_MAP = {
    aprovado: { bg: 'var(--green-bg)', c: 'var(--green)', lbl: 'Aprovado' },
    analise: { bg: 'var(--orange-bg)', c: 'var(--gold)', lbl: 'Em Análise' },
    pendente: { bg: 'var(--ford-light)', c: 'var(--ford-vivid)', lbl: 'Pendente' },
    reprovado: { bg: 'var(--red-bg)', c: 'var(--red)', lbl: 'Reprovado' }
};