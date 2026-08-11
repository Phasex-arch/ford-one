/**
 * ============================================================
 * DATA — Dados da aplicação
 * ============================================================
 */

// ─── CLIENTES ────────────────────────────────────────────────

/** @type {Cliente[]} */
export const CLIENTES = [
    {
        id: "C001",
        nome: "Carlos Eduardo Mendes",
        tel: "(11) 98245-1122",
        email: "carlos.mendes@gmail.com",
        ult: "15/04/2025",
        status: "ativo",
        v: 3,
        ltv: 482300,
        ini: "CM",
        seg: "Premium",
    },
    {
        id: "C002",
        nome: "Ana Paula Rodrigues",
        tel: "(11) 91234-5678",
        email: "ana.rodrigues@email.com",
        ult: "10/04/2025",
        status: "ativo",
        v: 2,
        ltv: 218700,
        ini: "AR",
        seg: "Família",
    },
    {
        id: "C003",
        nome: "Roberto Figueiredo",
        tel: "(11) 99876-5432",
        email: "roberto.f@empresa.com.br",
        ult: "02/04/2025",
        status: "potencial",
        v: 1,
        ltv: 145000,
        ini: "RF",
        seg: "Executivo",
    },
    {
        id: "C004",
        nome: "Fernanda Lima Costa",
        tel: "(11) 97654-3210",
        email: "fernanda.lima@gmail.com",
        ult: "28/03/2025",
        status: "ativo",
        v: 2,
        ltv: 334500,
        ini: "FL",
        seg: "Premium",
    },
    {
        id: "C005",
        nome: "Marcelo Augusto Pires",
        tel: "(11) 95555-0011",
        email: "marcelo.pires@outlook.com",
        ult: "20/03/2025",
        status: "inativo",
        v: 1,
        ltv: 98200,
        ini: "MP",
        seg: "Padrão",
    },
    {
        id: "C006",
        nome: "Juliana Cardoso Santos",
        tel: "(11) 98800-2244",
        email: "juliana.cardoso@gmail.com",
        ult: "18/04/2025",
        status: "ativo",
        v: 2,
        ltv: 276800,
        ini: "JC",
        seg: "Família",
    },
    {
        id: "C007",
        nome: "Paulo Ricardo Almeida",
        tel: "(11) 96677-8899",
        email: "paulo.almeida@empresa.com",
        ult: "05/04/2025",
        status: "ativo",
        v: 4,
        ltv: 721400,
        ini: "PA",
        seg: "VIP",
    },
    {
        id: "C008",
        nome: "Cristina Menezes Rocha",
        tel: "(11) 93344-5566",
        email: "cristina.rocha@gmail.com",
        ult: "01/04/2025",
        status: "potencial",
        v: 1,
        ltv: 189000,
        ini: "CR",
        seg: "Premium",
    },
    {
        id: "C009",
        nome: "Alexandre Torres",
        tel: "(11) 91122-3344",
        email: "alex.torres@gmail.com",
        ult: "14/04/2025",
        status: "ativo",
        v: 2,
        ltv: 312600,
        ini: "AT",
        seg: "Executivo",
    },
    {
        id: "C010",
        nome: "Beatriz Oliveira Neves",
        tel: "(11) 99988-7766",
        email: "beatriz.neves@outlook.com",
        ult: "12/04/2025",
        status: "ativo",
        v: 1,
        ltv: 167400,
        ini: "BO",
        seg: "Família",
    },
];

// ─── VEÍCULOS ─────────────────────────────────────────────────

export const VEICULOS = {
    C001: [
        {
            id: "VC001A",
            modelo: "Ford Bronco Sport",
            versao: "Badlands 2.0 EcoBoost AT6",
            ano: "2024/2024",
            cor: "Azul Arizona",
            km: "12.450",
            aq: "Mar 2024",
            saida: null,
            status: "ativo",
            atual: true,
            ult: "Revisão 10.000 km",
            img: null,
            hist: [
                { d: "Jan 2025", ev: "Revisão 10.000 km", det: "Troca de óleo, filtros e verificação geral", val: "R$ 1.240" },
                { d: "Mar 2024", ev: "Aquisição", det: "Compra via financiamento Ford Financeira", val: "R$ 189.900" }
            ],
            fin: { custo: "R$ 191.140", ticket: "R$ 1.240", est: "R$ 175.000" },
            ins: ["Revisão 20.000 km prevista para Jul/2025", "Alto potencial para acessórios off-road", "Perfil: uso intenso aos fins de semana"]
        },
        {
            id: "VC001B",
            modelo: "Ford Ranger Storm",
            versao: "3.0 V6 Diesel 4x4 AT10",
            ano: "2022/2022",
            cor: "Cinza Magnético",
            km: "48.200",
            aq: "Mai 2022",
            saida: "Mar 2024",
            status: "vendido",
            atual: false,
            ult: "Revisão 45.000 km",
            img: null,
            hist: [
                { d: "Jan 2024", ev: "Revisão 45.000 km", det: "Troca correias, fluidos e pastilhas", val: "R$ 3.800" },
                { d: "Mai 2022", ev: "Aquisição", det: "Compra à vista", val: "R$ 248.000" },
                { d: "Mar 2024", ev: "Venda/Troca", det: "Trocado por Bronco Sport", val: "—" }
            ],
            fin: { custo: "R$ 259.800", ticket: "R$ 2.633", est: "—" },
            ins: ["Trocou após 22 meses", "Ciclo acelerado de troca", "Provável interesse em Ranger 2025"]
        }
    ],
    C002: [
        {
            id: "VC002A",
            modelo: "Ford Territory Titanium",
            versao: "1.5 EcoBoost AT7",
            ano: "2025/2025",
            cor: "Branco Platinum",
            km: "3.200",
            aq: "Jan 2025",
            saida: null,
            status: "ativo",
            atual: true,
            ult: "Revisão 1.000 km",
            img: null,
            hist: [
                { d: "Fev 2025", ev: "Revisão 1.000 km", det: "Revisão inicial de rodagem", val: "R$ 380" },
                { d: "Jan 2025", ev: "Aquisição", det: "Compra via Ford Financeira", val: "R$ 179.900" }
            ],
            fin: { custo: "R$ 180.280", ticket: "R$ 380", est: "R$ 172.000" },
            ins: ["Próxima revisão em 10.000 km", "Perfil família — interesse em acessórios", "Oportunidade de plano de manutenção"]
        }
    ],
    C007: [
        {
            id: "VC007A",
            modelo: "Ford Bronco Sport",
            versao: "Wildtrak 2.0 EcoBoost",
            ano: "2024/2024",
            cor: "Eruption Green",
            km: "8.900",
            aq: "Ago 2024",
            saida: null,
            status: "ativo",
            atual: true,
            ult: "Revisão 5.000 km",
            img: null,
            hist: [
                { d: "Dez 2024", ev: "Revisão 5.000 km", det: "Revisão inicial", val: "R$ 780" },
                { d: "Ago 2024", ev: "Aquisição", det: "Compra à vista", val: "R$ 194.900" }
            ],
            fin: { custo: "R$ 195.680", ticket: "R$ 780", est: "R$ 185.000" },
            ins: ["Cliente VIP — atendimento prioritário", "4 veículos no histórico", "LTV total: R$ 721.400"]
        }
    ],
    C004: [
        {
            id: "VC004A",
            modelo: "Ford Bronco Sport",
            versao: "Outer Banks 2.0 EcoBoost",
            ano: "2023/2024",
            cor: "Cactus Gray",
            km: "22.100",
            aq: "Dez 2023",
            saida: null,
            status: "ativo",
            atual: true,
            ult: "Revisão 20.000 km",
            img: null,
            hist: [
                { d: "Mar 2025", ev: "Revisão 20.000 km", det: "Serviço completo + troca de pneus", val: "R$ 3.400" },
                { d: "Dez 2023", ev: "Aquisição", det: "Compra via financiamento", val: "R$ 184.900" }
            ],
            fin: { custo: "R$ 188.300", ticket: "R$ 1.700", est: "R$ 168.000" },
            ins: ["Revisão 30.000 km em Set/2025", "Interesse histórico em acessórios", "Padrão de troca: ~24 meses"]
        }
    ]
};

// ─── ESTOQUE ──────────────────────────────────────────────────

/** @type {Estoque[]} */
export const ESTOQUE = [
    {
        id: "E001",
        modelo: "Ford Bronco Sport",
        versao: "Badlands 2.0 EcoBoost AT6",
        ano: "2025",
        motor: "2.0 EcoBoost 250 cv",
        trans: "Automático 6 vel.",
        cond: "novo",
        status: "Disponível",
        preco: 209900,
        seg: "suv",
        cor: "Azul Arizona",
        img: null,
        estq: 4,
        km: null,
        ops: ["Teto panorâmico", "Câmera 360°", "Bancos em couro", "Apple CarPlay"]
    },
    {
        id: "E002",
        modelo: "Ford Ranger Storm",
        versao: "3.0 V6 Diesel 4x4 AT10",
        ano: "2025",
        motor: "3.0 TDCi V6 250 cv",
        trans: "Automático 10 vel.",
        cond: "novo",
        status: "Disponível",
        preco: 299900,
        seg: "picape",
        cor: "Cinza Magnético",
        img: null,
        estq: 2,
        km: null,
        ops: ["Pacote Off-Road", "SYNC 4", "Câmera 360°", 'Rodas 18"']
    },
    {
        id: "E003",
        modelo: "Ford Maverick Hybrid",
        versao: "XLT FWD 2.5 Hybrid",
        ano: "2025",
        motor: "2.5 Hybrid 190 cv",
        trans: "CVT",
        cond: "novo",
        status: "Disponível",
        preco: 189900,
        seg: "picape",
        cor: "Azul Stellar",
        img: null,
        estq: 2,
        km: null,
        ops: ["FordPass Connect", "SYNC 4", "Bandeja de carga"]
    },
    {
        id: "E004",
        modelo: "Ford Territory Titanium",
        versao: "1.5 EcoBoost AT7",
        ano: "2025",
        motor: "1.5 EcoBoost 150 cv",
        trans: "Automático 7 vel.",
        cond: "novo",
        status: "Reservado",
        preco: 179900,
        seg: "suv",
        cor: "Branco Platinum",
        img: null,
        estq: 1,
        km: null,
        ops: ["Teto solar", "Ambient Light", "Driver Assistance Pack"]
    },
    {
        id: "E005",
        modelo: "Ford Ranger XLS",
        versao: "2.2 Diesel 4x4 MT6",
        ano: "2024",
        motor: "2.2 TDCi 158 cv",
        trans: "Manual 6 vel.",
        cond: "novo",
        status: "Disponível",
        preco: 219900,
        seg: "picape",
        cor: "Vermelho Race Red",
        img: null,
        estq: 6,
        km: null,
        ops: ["Controle de tração", "Câmera traseira"]
    },
    {
        id: "E006",
        modelo: "Ford Mustang GT",
        versao: "5.0 V8 Fastback",
        ano: "2024",
        motor: "5.0 V8 450 cv",
        trans: "Manual 6 vel.",
        cond: "seminovo",
        status: "Disponível",
        preco: 389900,
        seg: "sedan",
        cor: "Azul Grabber",
        img: null,
        estq: 1,
        km: "18.400 km",
        ops: ["Pacote Pony", "Launch Control", "Performance Exhaust"]
    },
    {
        id: "E007",
        modelo: "Ford Bronco Sport",
        versao: "Big Bend 2.0 AT6",
        ano: "2024",
        motor: "2.0 EcoBoost 197 cv",
        trans: "Automático 6 vel.",
        cond: "seminovo",
        status: "Disponível",
        preco: 174900,
        seg: "suv",
        cor: "Área 51 (Verde)",
        img: null,
        estq: 1,
        km: "24.800 km",
        ops: ["SYNC 3", "Câmera traseira", "Sensores de estacionamento"]
    },
    {
        id: "E008",
        modelo: "Ford Territory SE",
        versao: "1.5 EcoBoost AT7",
        ano: "2023",
        motor: "1.5 EcoBoost 150 cv",
        trans: "Automático 7 vel.",
        cond: "seminovo",
        status: "Disponível",
        preco: 149900,
        seg: "suv",
        cor: "Cinza Magnetic",
        img: null,
        estq: 1,
        km: "31.200 km",
        ops: ["SYNC 3", "Câmera traseira"]
    }
];

// ─── LEADS ────────────────────────────────────────────────────

/** @type {Lead[]} */
export const LEADS = [
    {
        id: "L001",
        cli: "Carlos Eduardo Mendes",
        ini: "CM",
        v: "Ford Ranger Storm 2025",
        nec: "Upgrade de modelo",
        urg: "urgente",
        val: 299900,
        tel: "(11) 98245-1122",
        ins: "Cliente trocou Ranger em 22 meses. Bronco Sport adquirido Mar/2024. Alta propensão de troca. Revisão 20.000 km em Jul/2025 é janela ideal."
    },
    {
        id: "L002",
        cli: "Ana Paula Rodrigues",
        ini: "AR",
        v: "Ford Territory Titanium",
        nec: "Ampliação de veículo familiar",
        urg: "alta",
        val: 179900,
        tel: "(11) 91234-5678",
        ins: "2 filhos adicionados na base. Maverick 2022 não comporta família maior. Busca em concessionárias detectada via Ford Digital."
    },
    {
        id: "L003",
        cli: "Roberto Figueiredo",
        ini: "RF",
        v: "Ford Mustang GT",
        nec: "Veículo de alto desempenho",
        urg: "media",
        val: 389900,
        tel: "(11) 99876-5432",
        ins: "Perfil executivo. 3 visitas ao site Ford nos últimos 7 dias. Ausência de compra há 8 meses — timing ideal."
    },
    {
        id: "L004",
        cli: "Paulo Ricardo Almeida",
        ini: "PA",
        v: "Ford Bronco Sport Badlands",
        nec: "Revisão + possível novo modelo",
        urg: "urgente",
        val: 209900,
        tel: "(11) 96677-8899",
        ins: "OS #3912 com 4 visitas. LTV R$ 721k. Contato personalizado do gerente recomendado."
    },
    {
        id: "L005",
        cli: "Fernanda Lima Costa",
        ini: "FL",
        v: "Ford Territory Titanium",
        nec: "Renovação de plano de manutenção",
        urg: "media",
        val: 24800,
        tel: "(11) 97654-3210",
        ins: "Plano Ford Protect vence em 45 dias. Taxa de renovação histórica: 87%."
    },
    {
        id: "L006",
        cli: "Juliana Cardoso Santos",
        ini: "JC",
        v: "Ford Maverick Hybrid",
        nec: "Primeiro veículo Ford",
        urg: "alta",
        val: 189900,
        tel: "(11) 98800-2244",
        ins: "Veículo atual (não-Ford) com 4 anos e 68.000 km. Simulação de financiamento iniciada no site Ford há 3 dias."
    },
    {
        id: "L007",
        cli: "Alexandre Torres",
        ini: "AT",
        v: "Ford Ranger XLS 2025",
        nec: "Troca por modelo mais equipado",
        urg: "media",
        val: 219900,
        tel: "(11) 91122-3344",
        ins: "Ranger 2022 com 62.000 km. Solicitou test drive mas não foi atendido. Follow-up pendente há 6 dias."
    }
];

// ─── LEAD SCHEDULE ───────────────────────────────────────────

/** @type {Record<string,{dayOffset:number,slotIdx:number}>} */
export const leadSchedule = {};

// ─── AGENDA ──────────────────────────────────────────────────

export const SLOT_HOURS = [
    "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
];

/** @type {Tecnico[]} */
export const TECNICOS = [
    { nome: "André Souza", ini: "AS", esp: "Motor & Câmbio", status: "ocupado" },
    { nome: "Bruna Castro", ini: "BC", esp: "Elétrica & Eletrônica", status: "livre" },
    { nome: "Diego Ferreira", ini: "DF", esp: "Funilaria & Pintura", status: "ocupado" },
    { nome: "Eduardo Lima", ini: "EL", esp: "Revisão Geral", status: "livre" },
    { nome: "Flávia Mendes", ini: "FM", esp: "Suspensão & Freios", status: "pausa" },
    { nome: "Marcos Vieira", ini: "MV", esp: "Revisão Geral", status: "ocupado" }
];

/** @type {Object.<number, AgendaSlot[]>} */
export const DAILY_SLOTS = {};

// ─── SERVIÇOS ─────────────────────────────────────────────────

/** @type {{previstos:OrdemServico[],andamento:OrdemServico[],concluidos:OrdemServico[]}} */
export const SERVICOS = {
    previstos: [
        { num: "#4831", c: "Carlos Mendes", v: "Bronco Sport 2024", t: "Revisão 20.000 km", tech: "André Souza", prazo: "Hoje, 14:00", pc: "risco", val: "R$ 1.840" },
        { num: "#4832", c: "Ana Rodrigues", v: "Territory 2023", t: "Alinhamento + balanceamento", tech: "Eduardo Lima", prazo: "Hoje, 16:00", pc: "ok", val: "R$ 480" },
        { num: "#4833", c: "Fernanda Costa", v: "Ranger Storm 2022", t: "Revisão 30.000 km", tech: "André Souza", prazo: "Amanhã, 09:00", pc: "ok", val: "R$ 3.200" },
        { num: "#4834", c: "Paulo Almeida", v: "Maverick 2024", t: "Troca de pneus", tech: "Marcos Vieira", prazo: "Amanhã, 11:00", pc: "ok", val: "R$ 2.100" },
        { num: "#4835", c: "Beatriz Neves", v: "Ka Sedan 2021", t: "Revisão 15.000 km", tech: "Eduardo Lima", prazo: "22/04, 09:00", pc: "ok", val: "R$ 1.100" }
    ],
    andamento: [
        { num: "#4821", c: "Juliana Cardoso", v: "Territory SE 2023", t: "Reparo elétrico — Sensor airbag", tech: "Bruna Castro", prazo: "Hoje, 12:00", pc: "atrasado", val: "R$ 2.400" },
        { num: "#4822", c: "Marcelo Pires", v: "Ecosport 2020", t: "Funilaria — Porta dianteira", tech: "Diego Ferreira", prazo: "Hoje, 15:00", pc: "risco", val: "R$ 4.200" },
        { num: "#4823", c: "Alexandre Torres", v: "Ranger Storm 2022", t: "Substituição de correias", tech: "André Souza", prazo: "Hoje, 17:00", pc: "ok", val: "R$ 1.900" }
    ],
    concluidos: [
        { num: "#4810", c: "José Melo", v: "Ka Sedan 2020", t: "Revisão 60.000 km", tech: "André Souza", prazo: "Ontem", pc: "ok", val: "R$ 2.100" },
        { num: "#4811", c: "Mariana Silva", v: "Territory 2022", t: "Alinhamento e balanceamento", tech: "Eduardo Lima", prazo: "Ontem", pc: "ok", val: "R$ 480" },
        { num: "#4812", c: "Paulo Almeida", v: "Bronco Sport 2024", t: "Revisão 10.000 km", tech: "Marcos Vieira", prazo: "Ontem", pc: "ok", val: "R$ 1.240" },
        { num: "#4813", c: "Fernanda Costa", v: "Maverick 2024", t: "Instalação de acessórios", tech: "Diego Ferreira", prazo: "Ontem", pc: "ok", val: "R$ 3.800" }
    ]
};

// ─── AVALIAÇÕES ──────────────────────────────────────────────

/** @type {Avaliacao[]} */
export const AVALIACOES = [
    { c: "Carlos Eduardo Mendes", nota: 5, data: "15/04/2025", txt: "Excelente atendimento! O consultor foi muito atencioso e o serviço foi entregue antes do prazo. Com certeza voltarei.", detalhe: "Serviço: Revisão 10.000 km · Veículo: Bronco Sport 2024 · Consultor: Ricardo Costa" },
    { c: "Ana Paula Rodrigues", nota: 5, data: "10/04/2025", txt: "Muito satisfeita com a revisão. Fui informada de tudo que seria feito no veículo e o prazo foi respeitado.", detalhe: "Serviço: Revisão 1.000 km · Veículo: Territory Titanium · Consultor: Patrícia Oliveira" },
    { c: "Roberto Figueiredo", nota: 4, data: "02/04/2025", txt: "Bom atendimento. O tempo de espera foi um pouco maior que o previsto, mas o resultado final foi positivo.", detalhe: "Serviço: Alinhamento · Veículo: Ranger XLT · Consultor: Lucas Mendes" },
    { c: "Juliana Cardoso Santos", nota: 5, data: "18/04/2025", txt: "Problema resolvido rapidamente. Adorei o serviço de busca e entrega do veículo!", detalhe: "Serviço: Reparo elétrico · Veículo: Territory SE · Consultor: Ricardo Costa" },
    { c: "Paulo Ricardo Almeida", nota: 5, data: "05/04/2025", txt: "Cliente há 8 anos e continuo fiel. O gerente Ricardo sempre me trata com profissionalismo. Recomendo.", detalhe: "Serviço: Revisão 5.000 km · Veículo: Bronco Sport Wildtrak · Consultor: Ricardo Costa" }
];

// ─── METAS ────────────────────────────────────────────────────

/** @type {Meta[]} */
export const METAS = [
    { id: "M001", titulo: "Vendas Mensais", periodo: "Abril/2025", indicador: "vendas", atual: 22, alvo: 28, unidade: "un.", responsavel: "Equipe Comercial", lowerIsBetter: false },
    { id: "M002", titulo: "Receita Mensal", periodo: "Abril/2025", indicador: "receita", atual: 1248000, alvo: 1200000, unidade: "R$", responsavel: "Toda a Concessionária", lowerIsBetter: false },
    { id: "M003", titulo: "NPS", periodo: "Abril/2025", indicador: "nps", atual: 72, alvo: 70, unidade: "pts", responsavel: "Atendimento", lowerIsBetter: false },
    { id: "M004", titulo: "SLA Médio", periodo: "Abril/2025", indicador: "sla", atual: 2.3, alvo: 4, unidade: "h", responsavel: "Equipe Técnica", lowerIsBetter: true },
    { id: "M005", titulo: "Leads Qualificados", periodo: "Abril/2025", indicador: "leads", atual: 61, alvo: 80, unidade: "leads", responsavel: "Marketing", lowerIsBetter: false },
    { id: "M006", titulo: "Taxa de Conversão", periodo: "Abril/2025", indicador: "conv", atual: 34.2, alvo: 32, unidade: "%", responsavel: "Ricardo Costa", lowerIsBetter: false }
];

// ─── FINANCIAMENTOS ──────────────────────────────────────────

/** @type {Financiamento[]} */
export const FINANCIAMENTOS = [
    { id: "F001", cli: "Carlos Eduardo Mendes", ini: "CM", veiculo: "Bronco Sport Badlands 2024", valor: 189900, entrada: 38000, prazo: 48, taxa: 1.49, parcela: 3842, status: "aprovado", data: "Mar 2024" },
    { id: "F002", cli: "Ana Paula Rodrigues", ini: "AR", veiculo: "Territory Titanium 2025", valor: 179900, entrada: 30000, prazo: 60, taxa: 1.52, parcela: 3104, status: "aprovado", data: "Jan 2025" },
    { id: "F003", cli: "Juliana Cardoso Santos", ini: "JC", veiculo: "Maverick Hybrid 2025", valor: 189900, entrada: 20000, prazo: 60, taxa: 1.55, parcela: 3598, status: "analise", data: "Abr 2025" },
    { id: "F004", cli: "Roberto Figueiredo", ini: "RF", veiculo: "Mustang GT 2024", valor: 389900, entrada: 80000, prazo: 48, taxa: 1.65, parcela: 8294, status: "pendente", data: "Abr 2025" },
    { id: "F005", cli: "Alexandre Torres", ini: "AT", veiculo: "Ranger XLS 2025", valor: 219900, entrada: 44000, prazo: 36, taxa: 1.49, parcela: 6218, status: "aprovado", data: "Mar 2025" }
];

// ─── DASHBOARD ───────────────────────────────────────────────

export const DASH_DATA = {
    hoje: { leads: 8, ag: 5, rec: 48200, conv: 36.4, sla: 2.1, nota: 4.8, estq: 142 },
    semana: { leads: 61, ag: 34, rec: 287000, conv: 33.8, sla: 2.4, nota: 4.8, estq: 142 },
    mes: { leads: 238, ag: 158, rec: 1248000, conv: 34.2, sla: 2.3, nota: 4.8, estq: 142 },
    trimestre: { leads: 712, ag: 492, rec: 3780000, conv: 33.1, sla: 2.4, nota: 4.8, estq: 142 }
};

// ─── ACCESS LOG ──────────────────────────────────────────────

export const accessLog = {
    clientes: [
        { id: "C001", nome: "Carlos Eduardo Mendes", ini: "CM", hora: "09:14" },
        { id: "C007", nome: "Paulo Ricardo Almeida", ini: "PA", hora: "10:32" },
        { id: "C002", nome: "Ana Paula Rodrigues", ini: "AR", hora: "11:05" }
    ],
    veiculos: [
        { id: "VC001A", cid: "C001", modelo: "Ford Bronco Sport Badlands", cli: "Carlos Mendes", hora: "09:16" },
        { id: "VC007A", cid: "C007", modelo: "Ford Bronco Sport Wildtrak", cli: "Paulo Almeida", hora: "10:35" },
        { id: "VC002A", cid: "C002", modelo: "Ford Territory Titanium", cli: "Ana Rodrigues", hora: "11:07" }
    ]
};