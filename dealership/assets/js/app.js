/**
 * ============================================================
 * APP — Ponto de entrada principal
 * ============================================================
 */

import { $ } from './core/dom.js';
import { navigate, initRouter, getCurrentModule, registerModule } from './core/router.js';
import { debounce } from './core/utils.js';

// ─── IMPORTA TODOS OS MÓDULOS ──────────────────────────────

// Dashboard
import { initDashboard, filterDashPeriod, openKpi } from './modules/dashboard.js';

// Clientes
import { renderClientes, filterClients, openNovoClienteModal, salvarNovoCliente } from './modules/clientes.js';

// Histórico
import { renderHistorico, goHistorico, fecharHistoricoCliente, clearHistory } from './modules/historico.js';

// Estoque
import { renderEstoque, filterEstoque, openEstoqueModal, openVehicleModal, reservarUnidade } from './modules/estoque.js';

// Leads
import { renderLeads, renderPipelineBar, filterLeads, openLeadModal, openLeadSchedule, confirmLeadSchedule, cancelLeadSchedule, atenderLead, assumirLead } from './modules/leads.js';

// Agenda
import { renderAgenda, updateCapacity, shiftDay, openScheduleModal, cancelApt } from './modules/agenda.js';

// Serviços
import { renderServicos, switchTab, openOSModal, openOSEditModal, salvarEdicaoOS, moverOS, deletarOS, openNovaOSModal, salvarNovaOS } from './modules/servicos.js';

// Metas
import { renderMetas, openMetaModal, addMeta } from './modules/metas.js';

// Financiamentos
import { renderFinanciamentos, openContratoModal, openFinSimModal, calcFin, saveFinSim, openFinSimFromEstoque } from './modules/financiamentos.js';

// Receita
import { initReceitaCharts } from './modules/receita.js';

// Avaliação
import { renderAvaliacao, openAvalModal, enviarRespostaAval } from './modules/avaliacao.js';

// Desempenho
import { initDesempenhoCharts } from './modules/desempenho.js';

// Relatórios
import { renderRelatorios, exportarRelatorio, abrirPDF } from './modules/relatorios.js';

// Config
import { saveCfg, saveMetas, setTheme } from './modules/config.js';

// Componentes
import { showToast, markAllNotifsRead } from './components/notifications.js';
import { openModal, closeModal, closeDD, closeMobile } from './components/modals.js';
import { handleSearch, doSearch } from './components/search.js';

// ─── FUNÇÕES AUXILIARES ──────────────────────────────────────

/**
 * Ações do usuário (perfil, senha, sair)
 */
const udAction = (action) => {
    closeDD('userDropdown');
    if (action === 'perfil') {
        openKpi('perfil');
    } else if (action === 'senha') {
        openKpi('senha');
    } else if (action === 'sair') {
        showToast('Sessão encerrada. Até logo!', 'info');
        setTimeout(() => {
            document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#00095b;color:white;font-family:Inter,sans-serif;font-size:18px;letter-spacing:2px;font-weight:600">
          FORD ONE — SESSÃO ENCERRADA
        </div>
      `;
        }, 1200);
    }
};

// ─── REGISTRA TODOS OS MÓDULOS ──────────────────────────────

/**
 * Registra os handlers dos módulos no router
 */
const registerModules = () => {
    const modules = {
        dashboard: () => setTimeout(initDashboard, 50),
        clientes: renderClientes,
        historico: renderHistorico,
        estoque: () => {
            const grid = document.getElementById('estoqueGrid');
            if (grid) grid.innerHTML = '';
            renderEstoque();
        },
        leads: () => {
            renderPipelineBar();
            renderLeads();
        },
        agenda: () => {
            renderAgenda();
            setTimeout(updateCapacity, 100);
        },
        servicos: () => renderServicos('previstos'),
        avaliacao: renderAvaliacao,
        receita: () => setTimeout(initReceitaCharts, 90),
        desempenho: () => setTimeout(initDesempenhoCharts, 90),
        metas: renderMetas,
        financiamentos: renderFinanciamentos,
        relatorios: renderRelatorios,
        config: () => { } // será carregado quando necessário
    };

    Object.entries(modules).forEach(([name, handler]) => {
        registerModule(name, handler);
    });

    console.log('📦 Módulos registrados:', Object.keys(modules));
};

// ─── CONFIGURA EVENTOS ──────────────────────────────────────

/**
 * Configura eventos globais
 */
const setupEvents = () => {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const sb = document.getElementById('sidebar');
            const mc = document.getElementById('mainContent');
            if (window.innerWidth <= 768) {
                sb.classList.toggle('mobile-open');
                const overlay = document.getElementById('sidebarOverlay');
                if (overlay) {
                    overlay.style.display = sb.classList.contains('mobile-open') ? 'block' : 'none';
                }
            } else {
                sb.classList.toggle('collapsed');
                mc.classList.toggle('expanded');
            }
        });
    }

    // Search
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => handleSearch(e), 200));
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                const results = document.getElementById('searchResults');
                if (results) results.classList.remove('active');
            }, 200);
        });
    }

    // Notifications
    const notifBtn = document.getElementById('notifBtn');
    if (notifBtn) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('notifDropdown');
            if (dropdown) dropdown.classList.toggle('open');
            const userDropdown = document.getElementById('userDropdown');
            if (userDropdown) userDropdown.classList.remove('open');
        });
    }

    // User menu
    const userBtn = document.getElementById('userMenuBtn');
    if (userBtn) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) dropdown.classList.toggle('open');
            const notifDropdown = document.getElementById('notifDropdown');
            if (notifDropdown) notifDropdown.classList.remove('open');
        });
    }

    // Close dropdowns on click outside
    document.addEventListener('click', () => {
        const notifDropdown = document.getElementById('notifDropdown');
        const userDropdown = document.getElementById('userDropdown');
        if (notifDropdown) notifDropdown.classList.remove('open');
        if (userDropdown) userDropdown.classList.remove('open');
    });

    // Close mobile sidebar on overlay click
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeMobile);
    }

    // Resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const mod = getCurrentModule();
            if (mod === 'dashboard') initDashboard();
            if (mod === 'receita') initReceitaCharts();
            if (mod === 'desempenho') initDesempenhoCharts();
        }, 280);
    });
};

// ─── EXPÕE FUNÇÕES GLOBAIS PARA O HTML ─────────────────────

/**
 * Expõe todas as funções necessárias no objeto window
 * para serem chamadas via onclick no HTML
 */
const exposeGlobals = () => {
    // Core
    window.navigate = navigate;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.closeDD = closeDD;
    window.closeMobile = closeMobile;
    window.getCurrentModule = getCurrentModule;

    // Notificações
    window.showToast = showToast;
    window.markAllNotifsRead = markAllNotifsRead;
    window.udAction = udAction;

    // Dashboard
    window.filterDashPeriod = filterDashPeriod;
    window.openKpi = openKpi;
    window.initDashboard = initDashboard;

    // Clientes
    window.renderClientes = renderClientes;
    window.filterClients = filterClients;
    window.openNovoClienteModal = openNovoClienteModal;
    window.salvarNovoCliente = salvarNovoCliente;

    // Histórico
    window.goHistorico = goHistorico;
    window.fecharHistoricoCliente = fecharHistoricoCliente;
    window.clearHistory = clearHistory;

    // Estoque
    window.renderEstoque = renderEstoque;
    window.filterEstoque = filterEstoque;
    window.openEstoqueModal = openEstoqueModal;
    window.openVehicleModal = openVehicleModal;
    window.reservarUnidade = reservarUnidade;
    window.openFinSimFromEstoque = openFinSimFromEstoque;

    // Leads
    window.renderLeads = renderLeads;
    window.renderPipelineBar = renderPipelineBar;
    window.filterLeads = filterLeads;
    window.openLeadModal = openLeadModal;
    window.openLeadSchedule = openLeadSchedule;
    window.confirmLeadSchedule = confirmLeadSchedule;
    window.cancelLeadSchedule = cancelLeadSchedule;
    window.atenderLead = atenderLead;
    window.assumirLead = assumirLead;

    // Agenda
    window.renderAgenda = renderAgenda;
    window.updateCapacity = updateCapacity;
    window.shiftDay = shiftDay;
    window.openScheduleModal = openScheduleModal;
    window.cancelApt = cancelApt;

    // Serviços
    window.renderServicos = renderServicos;
    window.switchTab = switchTab;
    window.openOSModal = openOSModal;
    window.openOSEditModal = openOSEditModal;
    window.salvarEdicaoOS = salvarEdicaoOS;
    window.moverOS = moverOS;
    window.deletarOS = deletarOS;
    window.openNovaOSModal = openNovaOSModal;
    window.salvarNovaOS = salvarNovaOS;

    // Metas
    window.renderMetas = renderMetas;
    window.openMetaModal = openMetaModal;
    window.addMeta = addMeta;

    // Financiamentos
    window.renderFinanciamentos = renderFinanciamentos;
    window.openContratoModal = openContratoModal;
    window.openFinSimModal = openFinSimModal;
    window.calcFin = calcFin;
    window.saveFinSim = saveFinSim;

    // Receita
    window.initReceitaCharts = initReceitaCharts;

    // Avaliação
    window.renderAvaliacao = renderAvaliacao;
    window.openAvalModal = openAvalModal;
    window.enviarRespostaAval = enviarRespostaAval;

    // Desempenho
    window.initDesempenhoCharts = initDesempenhoCharts;

    // Relatórios
    window.renderRelatorios = renderRelatorios;
    window.exportarRelatorio = exportarRelatorio;
    window.abrirPDF = abrirPDF;

    // Config
    window.saveCfg = saveCfg;
    window.saveMetas = saveMetas;
    window.setTheme = setTheme;

    // Search
    window.handleSearch = handleSearch;
    window.doSearch = doSearch;

    console.log('🌐 Funções globais expostas com sucesso!');
};

// ─── INICIALIZAÇÃO ──────────────────────────────────────────

/**
 * Inicializa a aplicação
 */
const init = () => {
    console.log('🚗 Ford One v3.2 — Iniciando...');

    // Tema
    const savedTheme = localStorage.getItem('fo-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const lightBtn = document.getElementById('themeLight');
    const darkBtn = document.getElementById('themeDark');
    if (lightBtn) lightBtn.classList.toggle('active', savedTheme === 'light');
    if (darkBtn) darkBtn.classList.toggle('active', savedTheme === 'dark');

    // Router
    registerModules();
    initRouter();

    // Dashboard inicial
    initDashboard();

    // Renderiza dados iniciais
    renderClientes();
    renderEstoque();

    // Configura eventos
    setupEvents();

    // Expõe funções globais
    exposeGlobals();

    console.log('✅ Ford One v3.2 — Inicializado com sucesso!');
};

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);