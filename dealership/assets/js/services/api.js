/**
 * ============================================================
 * API — Simulação de chamadas à API
 * ============================================================
 */

import { CLIENTES, ESTOQUE, LEADS, SERVICOS, METAS, FINANCIAMENTOS, AVALIACOES, DASH_DATA } from './data.js';
import { loadFromStorage, saveToStorage } from './storage.js';

// ─── CONFIGURAÇÕES ────────────────────────────────────────────

const API_CONFIG = {
    baseURL: '/api',
    timeout: 5000,
    retries: 3,
    mock: true // Se true, usa dados mockados em vez de chamadas reais
};

// ─── UTILITÁRIOS ──────────────────────────────────────────────

/**
 * Simula um delay de rede
 * @param {number} ms - Milissegundos
 * @returns {Promise}
 */
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Simula uma resposta de API
 * @param {*} data - Dados a serem retornados
 * @param {number} status - Código de status HTTP
 * @returns {Promise<{data: *, status: number}>}
 */
const mockResponse = async (data, status = 200) => {
    await delay(200 + Math.random() * 300);
    return { data, status };
};

/**
 * Simula um erro de API
 * @param {string} message - Mensagem de erro
 * @param {number} status - Código de status HTTP
 * @returns {Promise<never>}
 */
const mockError = async (message, status = 500) => {
    await delay(200 + Math.random() * 300);
    throw { message, status };
};

// ─── CLIENTES ──────────────────────────────────────────────────

/**
 * Busca todos os clientes
 * @param {Object} params - Parâmetros de filtro
 * @param {string} params.search - Termo de busca
 * @param {string} params.status - Status do cliente
 * @param {string} params.order - Ordenação
 * @returns {Promise<{data: Cliente[], status: number}>}
 */
export const fetchClientes = async (params = {}) => {
    if (API_CONFIG.mock) {
        let data = [...CLIENTES];

        if (params.search) {
            const q = params.search.toLowerCase();
            data = data.filter(c =>
                c.nome.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q)
            );
        }

        if (params.status) {
            data = data.filter(c => c.status === params.status);
        }

        if (params.order === 'ltv') {
            data = data.sort((a, b) => b.ltv - a.ltv);
        } else if (params.order === 'ult') {
            data = data.sort((a, b) => {
                const da = new Date(a.ult.split('/').reverse().join('/'));
                const db = new Date(b.ult.split('/').reverse().join('/'));
                return db - da;
            });
        }

        return mockResponse(data);
    }

    // Chamada real para API
    const url = new URL(API_CONFIG.baseURL + '/clientes');
    Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
    });

    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        throw { message: 'Erro ao buscar clientes', status: response.status };
    }

    return { data: await response.json(), status: response.status };
};

/**
 * Busca um cliente por ID
 * @param {string} id - ID do cliente
 * @returns {Promise<{data: Cliente, status: number}>}
 */
export const fetchClienteById = async (id) => {
    if (API_CONFIG.mock) {
        const cliente = CLIENTES.find(c => c.id === id);
        if (!cliente) return mockError('Cliente não encontrado', 404);
        return mockResponse(cliente);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/clientes/${id}`);
    if (!response.ok) {
        throw { message: 'Cliente não encontrado', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

/**
 * Cria um novo cliente
 * @param {Object} cliente - Dados do cliente
 * @returns {Promise<{data: Cliente, status: number}>}
 */
export const createCliente = async (cliente) => {
    if (API_CONFIG.mock) {
        const newCliente = {
            ...cliente,
            id: 'C' + (100 + CLIENTES.length + 1),
            ult: new Date().toLocaleDateString('pt-BR'),
            v: 0,
            ltv: 0
        };
        CLIENTES.push(newCliente);
        return mockResponse(newCliente, 201);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
    });

    if (!response.ok) {
        throw { message: 'Erro ao criar cliente', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

/**
 * Atualiza um cliente
 * @param {string} id - ID do cliente
 * @param {Object} data - Dados atualizados
 * @returns {Promise<{data: Cliente, status: number}>}
 */
export const updateCliente = async (id, data) => {
    if (API_CONFIG.mock) {
        const index = CLIENTES.findIndex(c => c.id === id);
        if (index === -1) return mockError('Cliente não encontrado', 404);

        CLIENTES[index] = { ...CLIENTES[index], ...data };
        return mockResponse(CLIENTES[index]);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw { message: 'Erro ao atualizar cliente', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

/**
 * Remove um cliente
 * @param {string} id - ID do cliente
 * @returns {Promise<{status: number}>}
 */
export const deleteCliente = async (id) => {
    if (API_CONFIG.mock) {
        const index = CLIENTES.findIndex(c => c.id === id);
        if (index === -1) return mockError('Cliente não encontrado', 404);

        CLIENTES.splice(index, 1);
        return mockResponse(null, 204);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/clientes/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw { message: 'Erro ao remover cliente', status: response.status };
    }
    return { status: response.status };
};

// ─── ESTOQUE ──────────────────────────────────────────────────

/**
 * Busca todos os veículos do estoque
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<{data: Estoque[], status: number}>}
 */
export const fetchEstoque = async (params = {}) => {
    if (API_CONFIG.mock) {
        let data = [...ESTOQUE];

        if (params.search) {
            const q = params.search.toLowerCase();
            data = data.filter(e =>
                e.modelo.toLowerCase().includes(q) ||
                e.versao.toLowerCase().includes(q)
            );
        }

        if (params.cond) {
            data = data.filter(e => e.cond === params.cond);
        }

        if (params.seg) {
            data = data.filter(e => e.seg === params.seg);
        }

        return mockResponse(data);
    }

    const url = new URL(API_CONFIG.baseURL + '/estoque');
    Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
    });

    const response = await fetch(url);
    if (!response.ok) {
        throw { message: 'Erro ao buscar estoque', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

/**
 * Busca um veículo do estoque por ID
 * @param {string} id - ID do veículo
 * @returns {Promise<{data: Estoque, status: number}>}
 */
export const fetchEstoqueById = async (id) => {
    if (API_CONFIG.mock) {
        const item = ESTOQUE.find(e => e.id === id);
        if (!item) return mockError('Veículo não encontrado', 404);
        return mockResponse(item);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/estoque/${id}`);
    if (!response.ok) {
        throw { message: 'Veículo não encontrado', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

// ─── LEADS ────────────────────────────────────────────────────

/**
 * Busca todos os leads
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<{data: Lead[], status: number}>}
 */
export const fetchLeads = async (params = {}) => {
    if (API_CONFIG.mock) {
        let data = [...LEADS];

        if (params.urgency) {
            data = data.filter(l => l.urg === params.urgency);
        }

        if (params.search) {
            const q = params.search.toLowerCase();
            data = data.filter(l =>
                l.cli.toLowerCase().includes(q) ||
                l.v.toLowerCase().includes(q)
            );
        }

        return mockResponse(data);
    }

    const url = new URL(API_CONFIG.baseURL + '/leads');
    Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
    });

    const response = await fetch(url);
    if (!response.ok) {
        throw { message: 'Erro ao buscar leads', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

/**
 * Atualiza o status de um lead
 * @param {string} id - ID do lead
 * @param {string} status - Novo status
 * @returns {Promise<{data: Lead, status: number}>}
 */
export const updateLeadStatus = async (id, status) => {
    if (API_CONFIG.mock) {
        const lead = LEADS.find(l => l.id === id);
        if (!lead) return mockError('Lead não encontrado', 404);

        // Simula atualização
        return mockResponse({ ...lead, status });
    }

    const response = await fetch(`${API_CONFIG.baseURL}/leads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });

    if (!response.ok) {
        throw { message: 'Erro ao atualizar lead', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

// ─── SERVIÇOS ──────────────────────────────────────────────────

/**
 * Busca todas as ordens de serviço
 * @param {string} tab - Categoria: 'previstos', 'andamento', 'concluidos'
 * @returns {Promise<{data: OrdemServico[], status: number}>}
 */
export const fetchServicos = async (tab = 'previstos') => {
    if (API_CONFIG.mock) {
        const data = SERVICOS[tab] || [];
        return mockResponse(data);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/servicos/${tab}`);
    if (!response.ok) {
        throw { message: 'Erro ao buscar serviços', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

/**
 * Cria uma nova ordem de serviço
 * @param {Object} os - Dados da OS
 * @returns {Promise<{data: OrdemServico, status: number}>}
 */
export const createServico = async (os) => {
    if (API_CONFIG.mock) {
        const num = '#' + (4900 + SERVICOS.previstos.length + 1);
        const newOS = {
            ...os,
            num,
            pc: os.prioridade === 'urgente' ? 'risco' : 'ok'
        };
        SERVICOS.previstos.unshift(newOS);
        return mockResponse(newOS, 201);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/servicos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(os)
    });

    if (!response.ok) {
        throw { message: 'Erro ao criar OS', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

/**
 * Move uma OS para o próximo estágio
 * @param {string} id - ID da OS
 * @param {string} from - Categoria atual
 * @param {string} to - Categoria destino
 * @returns {Promise<{data: OrdemServico, status: number}>}
 */
export const moveServico = async (id, from, to) => {
    if (API_CONFIG.mock) {
        const fromList = SERVICOS[from];
        const index = fromList.findIndex(s => s.num === id);
        if (index === -1) return mockError('OS não encontrada', 404);

        const os = fromList.splice(index, 1)[0];
        SERVICOS[to].unshift(os);
        return mockResponse(os);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/servicos/${id}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to })
    });

    if (!response.ok) {
        throw { message: 'Erro ao mover OS', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

/**
 * Remove uma OS
 * @param {string} id - ID da OS
 * @param {string} tab - Categoria
 * @returns {Promise<{status: number}>}
 */
export const deleteServico = async (id, tab) => {
    if (API_CONFIG.mock) {
        const list = SERVICOS[tab];
        const index = list.findIndex(s => s.num === id);
        if (index === -1) return mockError('OS não encontrada', 404);

        list.splice(index, 1);
        return mockResponse(null, 204);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/servicos/${tab}/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw { message: 'Erro ao remover OS', status: response.status };
    }
    return { status: response.status };
};

// ─── METAS ────────────────────────────────────────────────────

/**
 * Busca todas as metas
 * @returns {Promise<{data: Meta[], status: number}>}
 */
export const fetchMetas = async () => {
    if (API_CONFIG.mock) {
        return mockResponse([...METAS]);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/metas`);
    if (!response.ok) {
        throw { message: 'Erro ao buscar metas', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

/**
 * Cria uma nova meta
 * @param {Object} meta - Dados da meta
 * @returns {Promise<{data: Meta, status: number}>}
 */
export const createMeta = async (meta) => {
    if (API_CONFIG.mock) {
        const newMeta = {
            ...meta,
            id: 'M' + Date.now(),
            atual: 0
        };
        METAS.push(newMeta);
        return mockResponse(newMeta, 201);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/metas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meta)
    });

    if (!response.ok) {
        throw { message: 'Erro ao criar meta', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

// ─── FINANCIAMENTOS ──────────────────────────────────────────

/**
 * Busca todos os financiamentos
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<{data: Financiamento[], status: number}>}
 */
export const fetchFinanciamentos = async (params = {}) => {
    if (API_CONFIG.mock) {
        let data = [...FINANCIAMENTOS];

        if (params.status) {
            data = data.filter(f => f.status === params.status);
        }

        return mockResponse(data);
    }

    const url = new URL(API_CONFIG.baseURL + '/financiamentos');
    Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
    });

    const response = await fetch(url);
    if (!response.ok) {
        throw { message: 'Erro ao buscar financiamentos', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

/**
 * Cria uma nova simulação de financiamento
 * @param {Object} fin - Dados do financiamento
 * @returns {Promise<{data: Financiamento, status: number}>}
 */
export const createFinanciamento = async (fin) => {
    if (API_CONFIG.mock) {
        const newFin = {
            ...fin,
            id: 'F' + Date.now(),
            status: 'pendente',
            data: 'Agora'
        };
        FINANCIAMENTOS.unshift(newFin);
        return mockResponse(newFin, 201);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/financiamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fin)
    });

    if (!response.ok) {
        throw { message: 'Erro ao criar financiamento', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

// ─── AVALIAÇÕES ──────────────────────────────────────────────

/**
 * Busca todas as avaliações
 * @returns {Promise<{data: Avaliacao[], status: number}>}
 */
export const fetchAvaliacoes = async () => {
    if (API_CONFIG.mock) {
        return mockResponse([...AVALIACOES]);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/avaliacoes`);
    if (!response.ok) {
        throw { message: 'Erro ao buscar avaliações', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

/**
 * Envia uma resposta para uma avaliação
 * @param {string} id - ID da avaliação
 * @param {string} resposta - Resposta do cliente
 * @returns {Promise<{status: number}>}
 */
export const responderAvaliacao = async (id, resposta) => {
    if (API_CONFIG.mock) {
        // Simula envio de resposta
        return mockResponse(null, 200);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/avaliacoes/${id}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resposta })
    });

    if (!response.ok) {
        throw { message: 'Erro ao enviar resposta', status: response.status };
    }
    return { status: response.status };
};

// ─── DASHBOARD ────────────────────────────────────────────────

/**
 * Busca dados do dashboard
 * @param {string} period - Período: 'hoje', 'semana', 'mes', 'trimestre'
 * @returns {Promise<{data: Object, status: number}>}
 */
export const fetchDashboardData = async (period = 'mes') => {
    if (API_CONFIG.mock) {
        const data = DASH_DATA[period] || DASH_DATA.mes;
        return mockResponse(data);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/dashboard/${period}`);
    if (!response.ok) {
        throw { message: 'Erro ao buscar dados do dashboard', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

// ─── RELATÓRIOS ───────────────────────────────────────────────

/**
 * Exporta um relatório
 * @param {string} type - Tipo de relatório
 * @param {string} format - Formato: 'pdf', 'csv', 'xlsx'
 * @param {Object} params - Parâmetros do relatório
 * @returns {Promise<{data: Blob, status: number}>}
 */
export const exportRelatorio = async (type, format = 'pdf', params = {}) => {
    if (API_CONFIG.mock) {
        // Simula download de arquivo
        const mockData = new Blob(['Relatório mockado'], { type: 'application/octet-stream' });
        return mockResponse(mockData);
    }

    const url = new URL(`${API_CONFIG.baseURL}/relatorios/${type}`);
    url.searchParams.append('format', format);
    Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
    });

    const response = await fetch(url);
    if (!response.ok) {
        throw { message: 'Erro ao exportar relatório', status: response.status };
    }
    return { data: await response.blob(), status: response.status };
};

// ─── CONFIGURAÇÕES ────────────────────────────────────────────

/**
 * Salva as configurações do sistema
 * @param {Object} config - Configurações
 * @returns {Promise<{status: number}>}
 */
export const saveConfig = async (config) => {
    if (API_CONFIG.mock) {
        saveToStorage('app_config', config);
        return mockResponse(null, 200);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    });

    if (!response.ok) {
        throw { message: 'Erro ao salvar configurações', status: response.status };
    }
    return { status: response.status };
};

/**
 * Busca as configurações do sistema
 * @returns {Promise<{data: Object, status: number}>}
 */
export const fetchConfig = async () => {
    if (API_CONFIG.mock) {
        const config = loadFromStorage('app_config', {
            dealership: {
                name: 'Ford São Paulo Centro',
                cnpj: '12.345.678/0001-90',
                code: 'SP-0142',
                manager: 'Ricardo Costa'
            },
            notifications: {
                sla: true,
                leads: true,
                relatorio: true,
                metas: false
            },
            theme: 'light',
            defaults: {
                salesGoal: 28,
                revenueGoal: 1200000,
                slaMax: 4,
                npsMin: 70
            }
        });
        return mockResponse(config);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/config`);
    if (!response.ok) {
        throw { message: 'Erro ao buscar configurações', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

// ─── AUTENTICAÇÃO ─────────────────────────────────────────────

/**
 * Simula login
 * @param {string} email - E-mail do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<{data: {token: string, user: Object}, status: number}>}
 */
export const login = async (email, password) => {
    if (API_CONFIG.mock) {
        if (email === 'admin@ford.com' && password === 'admin123') {
            return mockResponse({
                token: 'mock-jwt-token-' + Date.now(),
                user: {
                    id: 'U001',
                    name: 'Ricardo Costa',
                    email: 'admin@ford.com',
                    role: 'Gerente Comercial',
                    dealership: 'Ford SP Centro'
                }
            });
        }
        return mockError('Credenciais inválidas', 401);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        throw { message: 'Credenciais inválidas', status: response.status };
    }
    return { data: await response.json(), status: response.status };
};

/**
 * Simula logout
 * @returns {Promise<{status: number}>}
 */
export const logout = async () => {
    if (API_CONFIG.mock) {
        return mockResponse(null, 200);
    }

    const response = await fetch(`${API_CONFIG.baseURL}/auth/logout`, {
        method: 'POST'
    });

    if (!response.ok) {
        throw { message: 'Erro ao fazer logout', status: response.status };
    }
    return { status: response.status };
};

// ─── EXPOSIÇÃO GLOBAL ─────────────────────────────────────────

window.API = {
    fetchClientes,
    fetchClienteById,
    createCliente,
    updateCliente,
    deleteCliente,
    fetchEstoque,
    fetchEstoqueById,
    fetchLeads,
    updateLeadStatus,
    fetchServicos,
    createServico,
    moveServico,
    deleteServico,
    fetchMetas,
    createMeta,
    fetchFinanciamentos,
    createFinanciamento,
    fetchAvaliacoes,
    responderAvaliacao,
    fetchDashboardData,
    exportRelatorio,
    saveConfig,
    fetchConfig,
    login,
    logout
};