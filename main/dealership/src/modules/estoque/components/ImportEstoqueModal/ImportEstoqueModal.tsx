/**
 * @file ImportEstoqueModal.tsx
 * @module estoque
 * @description Importação real de estoque via CSV — antes era um botão
 * decorativo que só mostrava um toast de "Importando planilha..." sem
 * nenhuma chamada de API (ver auditoria, seção 3). Faz parse no navegador,
 * valida linha a linha e cria cada item via POST /estoque real, reportando
 * o que deu certo e o que falhou (com o motivo), sem inventar sucesso.
 *
 * Formato esperado (cabeçalho na primeira linha, separado por vírgula):
 * codigo,modelo,versao,ano,motor,transmissao,condicao,status,preco,segmento,cor,quantidade,km,opcionais
 * - condicao: NOVO ou SEMINOVO
 * - segmento: SUV, PICAPE, SEDAN, HATCH ou OUTRO
 * - opcionais: itens separados por ponto-e-vírgula dentro da célula (ex.: "Ar;Direção elétrica")
 */

import React, { useState } from 'react';
import type { ToastType } from '../../../../shared/hooks/useToast';
import { createEstoque, type CreateEstoqueInput } from '../../services/estoque.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => Promise<void>;
  showToast: (message: string, type?: ToastType) => void;
}

const CONDICOES = new Set(['NOVO', 'SEMINOVO']);
const SEGMENTOS = new Set(['SUV', 'PICAPE', 'SEDAN', 'HATCH', 'OUTRO']);
const COLUNAS = ['codigo', 'modelo', 'versao', 'ano', 'motor', 'transmissao', 'condicao', 'status', 'preco', 'segmento', 'cor', 'quantidade', 'km', 'opcionais'] as const;

/** Parser simples de CSV — respeita campos entre aspas com vírgula interna. */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

interface LinhaValidada { linha: number; input: CreateEstoqueInput; }
interface LinhaInvalida { linha: number; motivo: string; }

function validarLinhas(texto: string): { validas: LinhaValidada[]; invalidas: LinhaInvalida[] } {
  const linhasBrutas = texto.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (linhasBrutas.length === 0) return { validas: [], invalidas: [] };

  const header = parseCsvLine(linhasBrutas[0]).map(h => h.toLowerCase());
  const validas: LinhaValidada[] = [];
  const invalidas: LinhaInvalida[] = [];

  for (let i = 1; i < linhasBrutas.length; i++) {
    const numeroLinha = i + 1;
    const campos = parseCsvLine(linhasBrutas[i]);
    const row: Record<string, string> = {};
    header.forEach((col, idx) => { row[col] = campos[idx] ?? ''; });

    const faltando = COLUNAS.filter(c => c !== 'km' && c !== 'opcionais' && !row[c]);
    if (faltando.length > 0) {
      invalidas.push({ linha: numeroLinha, motivo: `campos obrigatórios ausentes: ${faltando.join(', ')}` });
      continue;
    }
    const condicao = row.condicao.toUpperCase();
    if (!CONDICOES.has(condicao)) {
      invalidas.push({ linha: numeroLinha, motivo: `condicao inválida "${row.condicao}" (use NOVO ou SEMINOVO)` });
      continue;
    }
    const segmento = row.segmento.toUpperCase();
    if (!SEGMENTOS.has(segmento)) {
      invalidas.push({ linha: numeroLinha, motivo: `segmento inválido "${row.segmento}" (use SUV, PICAPE, SEDAN, HATCH ou OUTRO)` });
      continue;
    }
    const preco = Number(row.preco.replace(',', '.'));
    if (!Number.isFinite(preco) || preco < 0) {
      invalidas.push({ linha: numeroLinha, motivo: `preco inválido "${row.preco}"` });
      continue;
    }
    const quantidade = Number(row.quantidade);
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      invalidas.push({ linha: numeroLinha, motivo: `quantidade inválida "${row.quantidade}"` });
      continue;
    }

    validas.push({
      linha: numeroLinha,
      input: {
        codigo: row.codigo,
        modelo: row.modelo,
        versao: row.versao,
        ano: row.ano,
        motor: row.motor,
        transmissao: row.transmissao,
        condicao: condicao as CreateEstoqueInput['condicao'],
        status: row.status,
        preco,
        segmento: segmento as CreateEstoqueInput['segmento'],
        cor: row.cor,
        quantidade,
        km: row.km || undefined,
        opcionais: row.opcionais ? row.opcionais.split(';').map(o => o.trim()).filter(Boolean) : [],
      },
    });
  }

  return { validas, invalidas };
}

export const ImportEstoqueModal: React.FC<Props> = ({ isOpen, onClose, onImported, showToast }) => {
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<{ sucesso: number; falhas: { linha: number; motivo: string }[] } | null>(null);

  const handleFile = async (file: File) => {
    setProcessando(true);
    setResultado(null);
    try {
      const texto = await file.text();
      const { validas, invalidas } = validarLinhas(texto);
      const falhas: { linha: number; motivo: string }[] = [...invalidas];
      let sucesso = 0;
      for (const { linha, input } of validas) {
        try {
          await createEstoque(input);
          sucesso += 1;
        } catch (error) {
          const motivo = error instanceof Error ? error.message : 'falha ao criar item';
          falhas.push({ linha, motivo });
        }
      }
      setResultado({ sucesso, falhas: falhas.sort((a, b) => a.linha - b.linha) });
      if (sucesso > 0) {
        await onImported();
        showToast(`${sucesso} item(ns) importado(s) pro estoque.`, falhas.length > 0 ? 'warning' : 'success');
      } else {
        showToast('Nenhum item importado — confira os erros abaixo.', 'warning');
      }
    } catch {
      showToast('Não foi possível ler o arquivo.', 'error');
    } finally {
      setProcessando(false);
    }
  };

  const fechar = () => { setResultado(null); onClose(); };

  return (
    <div className={`modal-ov${isOpen ? ' open' : ''}`} onClick={ev => { if (ev.target === ev.currentTarget) fechar(); }}>
      <div className="modal-box modal-sm">
        <button className="modal-x" onClick={fechar} type="button"><i className="ph-bold ph-x" /></button>
        <div className="m-body">
          <h2>Importar planilha de estoque</h2>
          <p className="mod-sub">
            Arquivo CSV com cabeçalho: <code>codigo,modelo,versao,ano,motor,transmissao,condicao,status,preco,segmento,cor,quantidade,km,opcionais</code>.
            Condição: NOVO ou SEMINOVO. Segmento: SUV, PICAPE, SEDAN, HATCH ou OUTRO. Opcionais separados por ponto-e-vírgula.
          </p>
          <label className="m-form" style={{ display: 'block', marginTop: 14 }}>
            <input
              type="file"
              accept=".csv,text/csv"
              disabled={processando}
              onChange={ev => { const f = ev.target.files?.[0]; if (f) handleFile(f); ev.target.value = ''; }}
            />
          </label>
          {processando && <p className="mod-sub" style={{ marginTop: 12 }}>Importando linha a linha...</p>}
          {resultado && (
            <div className="m-sec" style={{ marginTop: 14 }}>
              <div className="m-sec-title">Resultado</div>
              <p><strong style={{ color: 'var(--green)' }}>{resultado.sucesso}</strong> item(ns) importado(s) com sucesso.</p>
              {resultado.falhas.length > 0 && (
                <>
                  <p style={{ color: 'var(--red)' }}><strong>{resultado.falhas.length}</strong> linha(s) com erro:</p>
                  <ul style={{ maxHeight: 180, overflowY: 'auto', fontSize: 'var(--fs1)', paddingLeft: 18 }}>
                    {resultado.falhas.map(f => <li key={f.linha}>Linha {f.linha}: {f.motivo}</li>)}
                  </ul>
                </>
              )}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="btn-sec" onClick={fechar}>Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
};
