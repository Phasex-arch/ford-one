/**
 * ============================================================
 * TYPES — Definições de tipos JSDoc
 * ============================================================
 * Este arquivo contém apenas definições de tipos para o
 * editor reconhecer via @ts-check. Não contém código executável.
 * ============================================================
 */

// ─── CLIENTES ────────────────────────────────────────────────

/**
 * @typedef {'ativo'|'inativo'|'potencial'} ClienteStatus
 * @typedef {'Premium'|'VIP'|'Família'|'Executivo'|'Padrão'} ClienteSegmento
 */

/**
 * @typedef {Object} Cliente
 * @property {string}          id
 * @property {string}          nome
 * @property {string}          tel
 * @property {string}          email
 * @property {string}          ult      - Data do último atendimento (dd/mm/yyyy)
 * @property {ClienteStatus}   status
 * @property {number}          v        - Quantidade de veículos
 * @property {number}          ltv      - Lifetime value em número puro
 * @property {string}          ini      - Iniciais para avatar
 * @property {ClienteSegmento} seg
 */

// ─── VEÍCULOS ────────────────────────────────────────────────

/**
 * @typedef {Object} HistoricoItem
 * @property {string} d    - Data (ex: 'Jan 2025')
 * @property {string} ev   - Evento
 * @property {string} det  - Detalhe
 * @property {string} val  - Valor formatado ou '—'
 */

/**
 * @typedef {Object} VeiculoFinanceiro
 * @property {string} custo
 * @property {string} ticket
 * @property {string} est
 */

/**
 * @typedef {Object} Veiculo
 * @property {string}                      id
 * @property {string}                      modelo
 * @property {string}                      versao
 * @property {string}                      ano
 * @property {string}                      cor
 * @property {string}                      km
 * @property {string}                      aq        - Data de aquisição
 * @property {string|null}                 saida
 * @property {'ativo'|'vendido'|'substituido'} status
 * @property {boolean}                     atual
 * @property {string}                      ult       - Último serviço
 * @property {string|null}                 img
 * @property {HistoricoItem[]}             hist
 * @property {VeiculoFinanceiro}           fin
 * @property {string[]}                    ins       - Insights comerciais
 */

// ─── ESTOQUE ─────────────────────────────────────────────────

/**
 * @typedef {'novo'|'seminovo'}             EstoqueCondicao
 * @typedef {'suv'|'picape'|'sedan'}        EstoqueSegmento
 */

/**
 * @typedef {Object} Estoque
 * @property {string}            id
 * @property {string}            modelo
 * @property {string}            versao
 * @property {string}            ano
 * @property {string}            motor
 * @property {string}            trans
 * @property {EstoqueCondicao}   cond
 * @property {string}            status
 * @property {number}            preco
 * @property {EstoqueSegmento}   seg
 * @property {string}            cor
 * @property {string|null}       img
 * @property {number}            estq
 * @property {string|null}       km
 * @property {string[]}          ops
 */

// ─── LEADS ────────────────────────────────────────────────────

/**
 * @typedef {'urgente'|'alta'|'media'|'baixa'} LeadUrgencia
 */

/**
 * @typedef {Object} Lead
 * @property {string}       id
 * @property {string}       cli
 * @property {string}       ini
 * @property {string}       v     - Veículo de interesse
 * @property {string}       nec   - Necessidade identificada
 * @property {LeadUrgencia} urg
 * @property {number}       val   - Valor estimado
 * @property {string}       tel
 * @property {string}       ins   - Insight gerado por IA
 */

// ─── AGENDA ──────────────────────────────────────────────────

/**
 * @typedef {'livre'|'ocupado'|'pausa'} TecnicoStatus
 */

/**
 * @typedef {Object} Tecnico
 * @property {string}        nome
 * @property {string}        ini
 * @property {string}        esp    - Especialidade
 * @property {TecnicoStatus} status
 */

/**
 * @typedef {Object} Appointment
 * @property {string}  cli
 * @property {string}  type
 * @property {string}  tech
 * @property {string}  cls
 * @property {boolean} cancelled
 */

/**
 * @typedef {Object} AgendaSlot
 * @property {string}        hora
 * @property {Appointment[]} apts
 */

// ─── SERVIÇOS ─────────────────────────────────────────────────

/**
 * @typedef {Object} OrdemServico
 * @property {string}                    num
 * @property {string}                    c      - Cliente
 * @property {string}                    v      - Veículo
 * @property {string}                    t      - Tipo de serviço
 * @property {string}                    tech   - Técnico
 * @property {string}                    prazo
 * @property {'ok'|'risco'|'atrasado'}   pc
 * @property {string}                    val    - Valor formatado
 */

// ─── FINANCIAMENTOS ──────────────────────────────────────────

/**
 * @typedef {'aprovado'|'analise'|'pendente'|'reprovado'} FinanciamentoStatus
 */

/**
 * @typedef {Object} Financiamento
 * @property {string}               id
 * @property {string}               cli
 * @property {string}               ini
 * @property {string}               veiculo
 * @property {number}               valor
 * @property {number}               entrada
 * @property {number}               prazo
 * @property {number}               taxa
 * @property {number}               parcela
 * @property {FinanciamentoStatus}  status
 * @property {string}               data
 */

// ─── AVALIAÇÕES ──────────────────────────────────────────────

/**
 * @typedef {Object} Avaliacao
 * @property {string} c       - Nome do cliente
 * @property {number} nota    - Nota de 1 a 5
 * @property {string} data
 * @property {string} txt
 * @property {string} detalhe
 */

// ─── METAS ────────────────────────────────────────────────────

/**
 * @typedef {'vendas'|'receita'|'leads'|'nps'|'sla'|'conv'} MetaIndicador
 */

/**
 * @typedef {Object} Meta
 * @property {string}         id
 * @property {string}         titulo
 * @property {string}         periodo
 * @property {MetaIndicador}  indicador
 * @property {number}         atual
 * @property {number}         alvo
 * @property {string}         unidade
 * @property {string}         responsavel
 * @property {boolean}        lowerIsBetter
 */