/**
 * ============================================================
 * CHARTS — Utilitários de gráficos (Canvas)
 * ============================================================
 */

import { $ } from '../core/dom.js';

/**
 * Obtém as cores do tema atual
 */
const getThemeColors = () => {
    const computed = getComputedStyle(document.documentElement);
    return {
        text: computed.getPropertyValue('--chart-text').trim() || '#9CA3AF',
        grid: computed.getPropertyValue('--chart-grid').trim() || '#E5EAF2',
        card: computed.getPropertyValue('--chart-card').trim() || '#fff'
    };
};

/**
 * Configura um canvas para desenho
 * @param {string} id - ID do canvas
 * @returns {Object|null} Contexto e dimensões
 */
const setupCanvas = (id) => {
    const canvas = document.getElementById(id);
    if (!canvas) return null;

    const rect = canvas.parentElement?.getBoundingClientRect?.() || { width: 400 };
    const W = rect.width || 400;
    const H = 210;

    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(devicePixelRatio, devicePixelRatio);

    return { ctx, W, H };
};

/**
 * Desenha um gráfico de linha
 * @param {string} id - ID do canvas
 * @param {Object} cfg - Configuração do gráfico
 */
export const drawLine = (id, cfg) => {
    const setup = setupCanvas(id);
    if (!setup) return;

    const { ctx, W, H } = setup;
    const padding = { t: 18, r: 18, b: 26, l: 44 };
    const pw = W - padding.l - padding.r;
    const ph = H - padding.t - padding.b;

    const all = cfg.sets.flatMap(s => s.data);
    const mn = Math.min(...all) * 0.88;
    const mx = Math.max(...all) * 1.1;

    const tx = (i) => padding.l + (i / (cfg.labels.length - 1)) * pw;
    const ty = (v) => padding.t + ph - ((v - mn) / (mx - mn)) * ph;

    const colors = getThemeColors();

    const draw = () => {
        ctx.clearRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.t + (i / 4) * ph;
            ctx.beginPath();
            ctx.moveTo(padding.l, y);
            ctx.lineTo(W - padding.r, y);
            ctx.stroke();

            ctx.fillStyle = colors.text;
            ctx.font = '10px Inter,sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(
                Math.round(mx - (i / 4) * (mx - mn)) + (cfg.unit || ''),
                padding.l - 6,
                y + 3.5
            );
        }

        // Labels
        ctx.fillStyle = colors.text;
        ctx.font = '10px Inter,sans-serif';
        ctx.textAlign = 'center';
        cfg.labels.forEach((l, i) => ctx.fillText(l, tx(i), H - padding.b + 13));

        // Lines
        cfg.sets.forEach((ds) => {
            const pts = ds.data.map((v, i) => [tx(i), ty(v)]);

            if (ds.fill) {
                ctx.beginPath();
                ctx.moveTo(pts[0][0], ty(mn));
                pts.forEach(([x, y]) => ctx.lineTo(x, y));
                ctx.lineTo(pts[pts.length - 1][0], ty(mn));
                ctx.closePath();

                const grad = ctx.createLinearGradient(0, padding.t, 0, padding.t + ph);
                grad.addColorStop(0, ds.color + '24');
                grad.addColorStop(1, ds.color + '03');
                ctx.fillStyle = grad;
                ctx.fill();
            }

            ctx.beginPath();
            pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
            ctx.strokeStyle = ds.color;
            ctx.lineWidth = 2.5;
            ctx.setLineDash(ds.dashed ? [6, 4] : []);
            ctx.stroke();
            ctx.setLineDash([]);

            if (!ds.dashed) {
                pts.forEach(([x, y]) => {
                    ctx.beginPath();
                    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
                    ctx.fillStyle = ds.color;
                    ctx.fill();
                    ctx.strokeStyle = colors.card;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                });
            }
        });
    };

    draw();

    // Interação
    const canvas = document.getElementById(id);
    if (!canvas) return;

    canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;

        let ni = 0, nd = Infinity;
        cfg.labels.forEach((_, i) => {
            const d = Math.abs(tx(i) - mx);
            if (d < nd) { nd = d; ni = i; }
        });

        if (nd < 38) {
            showTooltip(id, e.clientX, e.clientY,
                `<strong>${cfg.labels[ni]}</strong><br>${cfg.sets.map(ds => ds.data[ni] + (cfg.unit || '')).join(' / ')}`
            );
        } else {
            hideTooltip(id);
        }
    };

    canvas.onmouseleave = () => hideTooltip(id);
};

/**
 * Desenha um gráfico de barras
 * @param {string} id - ID do canvas
 * @param {Object} cfg - Configuração do gráfico
 */
export const drawBar = (id, cfg) => {
    const setup = setupCanvas(id);
    if (!setup) return;

    const { ctx, W, H } = setup;
    const padding = { t: 18, r: 18, b: 26, l: 44 };
    const pw = W - padding.l - padding.r;
    const ph = H - padding.t - padding.b;

    const mx = Math.max(...cfg.data) * 1.15;
    const bw = (pw / cfg.data.length) * 0.58;
    const gap = (pw / cfg.data.length) * 0.21;

    const colors = getThemeColors();

    const draw = (hoverIdx = -1) => {
        ctx.clearRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.t + (i / 4) * ph;
            ctx.beginPath();
            ctx.moveTo(padding.l, y);
            ctx.lineTo(W - padding.r, y);
            ctx.stroke();

            ctx.fillStyle = colors.text;
            ctx.font = '10px Inter,sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(
                Math.round(mx - (i / 4) * mx) + (cfg.unit || ''),
                padding.l - 6,
                y + 3.5
            );
        }

        // Bars
        cfg.data.forEach((v, i) => {
            const x = padding.l + i * (pw / cfg.data.length) + gap;
            const bh = (v / mx) * ph;
            const y = padding.t + ph - bh;
            const r = 3;
            const isHover = hoverIdx === i;

            const grad = ctx.createLinearGradient(0, y, 0, y + bh);
            grad.addColorStop(0, isHover ? cfg.color + 'EE' : cfg.color);
            grad.addColorStop(1, cfg.color + '66');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + bw - r, y);
            ctx.quadraticCurveTo(x + bw, y, x + bw, y + r);
            ctx.lineTo(x + bw, y + bh);
            ctx.lineTo(x, y + bh);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();

            if (isHover) {
                ctx.strokeStyle = cfg.color;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.fillStyle = colors.text;
            ctx.font = `${isHover ? 'bold' : 'normal'} 10px Inter,sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(v + (cfg.unit || ''), x + bw / 2, y - 5);
            ctx.fillText(cfg.labels[i], x + bw / 2, H - padding.b + 13);
        });
    };

    draw();

    const canvas = document.getElementById(id);
    if (!canvas) return;

    canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        let hover = -1;

        cfg.data.forEach((_, i) => {
            const x = padding.l + i * (pw / cfg.data.length) + gap;
            if (mx >= x && mx <= x + bw) hover = i;
        });

        draw(hover);
        if (hover >= 0) {
            showTooltip(id, e.clientX, e.clientY,
                `<strong>${cfg.labels[hover]}</strong><br>${cfg.data[hover]}${cfg.unit || ''}`
            );
        } else {
            hideTooltip(id);
        }
    };

    canvas.onmouseleave = () => {
        draw(-1);
        hideTooltip(id);
    };
};

/**
 * Desenha um gráfico de pizza
 * @param {string} id - ID do canvas
 * @param {Object} cfg - Configuração do gráfico
 */
export const drawPie = (id, cfg) => {
    const setup = setupCanvas(id);
    if (!setup) return;

    const { ctx, W, H } = setup;
    const cx = W * 0.31;
    const cy = H / 2;
    const r = Math.min(cx, cy) - 13;
    const ir = r * 0.54;

    const total = cfg.data.reduce((a, b) => a + b, 0);
    let angle = -Math.PI / 2;

    const slices = [];
    cfg.data.forEach((v, i) => {
        const slice = (v / total) * Math.PI * 2;
        slices.push({ start: angle, end: angle + slice, color: cfg.colors[i], value: v });
        angle += slice;
    });

    const colors = getThemeColors();

    const draw = (hoverIdx = -1) => {
        ctx.clearRect(0, 0, W, H);

        slices.forEach((sl, i) => {
            const isHover = hoverIdx === i;
            const exp = isHover ? 5 : 0;
            const mid = (sl.start + sl.end) / 2;
            const ox = Math.cos(mid) * exp;
            const oy = Math.sin(mid) * exp;

            ctx.beginPath();
            ctx.moveTo(cx + ox, cy + oy);
            ctx.arc(cx + ox, cy + oy, r, sl.start, sl.end);
            ctx.closePath();
            ctx.fillStyle = sl.color;
            ctx.fill();
            ctx.strokeStyle = colors.card;
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Centro
        ctx.beginPath();
        ctx.arc(cx, cy, ir, 0, Math.PI * 2);
        ctx.fillStyle = colors.card;
        ctx.fill();

        ctx.fillStyle = colors.text;
        ctx.font = 'bold 13px Inter,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(hoverIdx >= 0 ? cfg.data[hoverIdx] + '%' : '100%', cx, cy + 4);

        // Legenda
        const lx = W * 0.6;
        let ly = cy - (cfg.labels.length * 21) / 2 + 8;

        cfg.labels.forEach((l, i) => {
            ctx.fillStyle = cfg.colors[i];
            ctx.fillRect(lx, ly - 7, 10, 10);

            ctx.fillStyle = colors.text;
            ctx.font = hoverIdx === i ? 'bold 10.5px Inter,sans-serif' : '10.5px Inter,sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${l} (${cfg.data[i]}%)`, lx + 14, ly + 2);
            ly += 22;
        });
    };

    draw();

    const canvas = document.getElementById(id);
    if (!canvas) return;

    canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let hover = -1;
        if (dist < r && dist > ir) {
            let a = Math.atan2(dy, dx);
            if (a < -Math.PI / 2) a += Math.PI * 2;
            slices.forEach((sl, i) => {
                if (a >= sl.start && a < sl.end) hover = i;
            });
        }

        draw(hover);
        if (hover >= 0) {
            showTooltip(id, e.clientX, e.clientY,
                `<strong>${cfg.labels[hover]}</strong><br>${cfg.data[hover]}%`
            );
        } else {
            hideTooltip(id);
        }
    };

    canvas.onmouseleave = () => {
        draw(-1);
        hideTooltip(id);
    };
};

/**
 * Exibe um tooltip
 */
const showTooltip = (id, x, y, html) => {
    let tip = document.getElementById('tip-' + id);
    if (!tip) {
        tip = document.createElement('div');
        tip.id = 'tip-' + id;
        tip.className = 'ch-tip';
        document.body.appendChild(tip);
    }
    tip.innerHTML = html;
    tip.style.left = x + 14 + 'px';
    tip.style.top = y - 10 + 'px';
    tip.classList.add('on');
};

/**
 * Esconde um tooltip
 */
const hideTooltip = (id) => {
    const tip = document.getElementById('tip-' + id);
    if (tip) tip.classList.remove('on');
};