import React, { useEffect, useMemo, useState } from 'react';
import type { ToastType } from '../../../../shared/hooks/useToast';
import { friendlyApiMessage } from '../../../../shared/api/client';
import {
  createEstoque,
  fetchCatalogVehicles,
  type CatalogVehicle,
  type CreateEstoqueInput,
} from '../../services/estoque.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
  showToast: (message: string, type?: ToastType) => void;
}

const segmentMap: Record<string, CreateEstoqueInput['segmento']> = {
  SUV: 'SUV',
  PICAPE: 'PICAPE',
  SEDAN: 'SEDAN',
  HATCH: 'HATCH',
};

// Mesma segmentação de cor-base usada pelo scraper (pdf-text-extractor.service.ts,
// extractColors) — mapeando a primeira palavra do nome pra uma cor aproximada.
const COLOR_HEX: Record<string, string> = {
  preto: '#1c1c1e',
  branco: '#f4f4f4',
  cinza: '#8b8f94',
  azul: '#1d3f8f',
  prata: '#c7c9cc',
  vermelho: '#c62828',
  laranja: '#e2661c',
  verde: '#2e7d46',
  marrom: '#6b4226',
  bege: '#d8c9a3',
  amarelo: '#e0b400',
  dourado: '#b8962e',
  bronze: '#8c6a3f',
  grafite: '#3b3d40',
};

export const AddEstoqueModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCreated,
  showToast,
}) => {
  const [vehicles, setVehicles] = useState<CatalogVehicle[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CatalogVehicle | null>(null);
  const [form, setForm] = useState({
    codigo: '',
    condicao: 'NOVO' as CreateEstoqueInput['condicao'],
    status: 'Disponivel',
    preco: '',
    cor: '',
    quantidade: '1',
    km: '',
    opcionais: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(null);
    setSearch('');
    setLoading(true);
    fetchCatalogVehicles()
      .then(setVehicles)
      .catch((error: unknown) => showToast(friendlyApiMessage(error), 'error'))
      .finally(() => setLoading(false));
  }, [isOpen, showToast]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return vehicles;
    return vehicles.filter((vehicle) =>
      `${vehicle.modelo} ${vehicle.versao} ${vehicle.ano_modelo}`
        .toLowerCase()
        .includes(query),
    );
  }, [search, vehicles]);

  const mainImage = (vehicle: CatalogVehicle) =>
    vehicle.imagens.find((image) => image.tipo === 'principal')?.url ??
    vehicle.imagens[0]?.url;

  const colorHex = (nome: string) => {
    const key = nome
      .trim()
      .split(/\s+/)[0]
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return COLOR_HEX[key] ?? '#9196ae';
  };

  const selectVehicle = (vehicle: CatalogVehicle) => {
    setSelected(vehicle);
    setForm((current) => ({
      ...current,
      preco: vehicle.preco_inicial?.toString() ?? '',
      cor: vehicle.cores[0]?.nome ?? '',
    }));
  };

  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      const payload: CreateEstoqueInput = {
        codigo: form.codigo.trim(),
        modelo: selected.modelo,
        versao: selected.versao,
        ano: String(selected.ano_modelo),
        motor: selected.motorizacao.descricao || 'Não informado',
        transmissao: selected.motorizacao.transmissao || 'Não informada',
        condicao: form.condicao,
        status: form.status.trim() || 'Disponivel',
        preco: Number(form.preco),
        segmento: segmentMap[selected.categoria_principal] ?? 'OUTRO',
        cor: form.cor.trim() || 'Não informada',
        imagem: mainImage(selected),
        quantidade: Number(form.quantidade),
        km: form.km.trim() || undefined,
        opcionais: form.opcionais
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      };
      await createEstoque(payload);
      await onCreated();
      showToast('Veículo adicionado ao estoque.', 'success');
      onClose();
    } catch (error) {
      showToast(friendlyApiMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`modal-ov${isOpen ? ' open' : ''}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-box modal-lg">
        <button className="modal-x" onClick={onClose} type="button">
          <i className="ph-bold ph-x" />
        </button>
        <div className="m-body">
          <h2>Adicionar veículo ao estoque</h2>
          {!selected ? (
            <>
              <p className="mod-sub">Selecione um veículo do catálogo Ford sincronizado.</p>
              <div className="srch-field" style={{ margin: '14px 0' }}>
                <i className="ph-bold ph-magnifying-glass" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar modelo, versão ou ano..."
                />
              </div>
              {loading ? <p>Carregando catálogo...</p> : (
                <div className="cat-veh-grid">
                  {filtered.map((vehicle) => (
                    <button
                      type="button"
                      className="cat-veh-card"
                      key={vehicle.id}
                      onClick={() => selectVehicle(vehicle)}
                    >
                      <div className="cat-veh-photo">
                        {mainImage(vehicle)
                          ? <img src={mainImage(vehicle)} alt={vehicle.modelo} loading="lazy" />
                          : <i className="ph-bold ph-car-profile" />}
                      </div>
                      <div className="cat-veh-body">
                        <strong>{vehicle.modelo} {vehicle.versao}</strong>
                        <div className="cat-veh-meta">
                          <span className="chip-neutral">{vehicle.ano_modelo}</span>
                          <span className="chip-neutral">{vehicle.categoria_principal}</span>
                        </div>
                        <div className="cat-veh-specs">
                          {vehicle.motorizacao.combustivel ? (
                            <span className={`chip-spec${vehicle.motorizacao.combustivel === 'Elétrico' ? ' elec' : ''}`}>
                              <i className={`ph-bold ${vehicle.motorizacao.combustivel === 'Elétrico' ? 'ph-lightning' : 'ph-gas-pump'}`} />
                              {vehicle.motorizacao.combustivel}
                            </span>
                          ) : (
                            <span className="chip-neutral">Motor não informado</span>
                          )}
                          {vehicle.motorizacao.potencia_cv ? (
                            <span className="chip-neutral">{vehicle.motorizacao.potencia_cv} cv</span>
                          ) : null}
                        </div>
                        <div className="cat-veh-swatches">
                          {vehicle.cores.length ? (
                            <>
                              {vehicle.cores.slice(0, 4).map((cor) => (
                                <span
                                  key={cor.nome}
                                  className="cat-veh-swatch"
                                  style={{ background: colorHex(cor.nome) }}
                                  title={cor.nome}
                                />
                              ))}
                              {vehicle.cores.length > 4 && (
                                <span className="cat-veh-swatch-more">+{vehicle.cores.length - 4}</span>
                              )}
                            </>
                          ) : (
                            <span className="cat-veh-no-color">cor não informada</span>
                          )}
                        </div>
                        <div className="cat-veh-price">
                          <div className="mf-lbl">a partir de</div>
                          <div className="mf-val">{vehicle.preco_inicial ? `R$ ${vehicle.preco_inicial.toLocaleString('pt-BR')}` : 'Preço não informado'}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {!filtered.length && <p>Nenhum veículo do catálogo encontrado.</p>}
                </div>
              )}
            </>
          ) : (
            <form className="m-form" onSubmit={submit}>
              <div className="m-sec">
                <div className="m-sec-title">Dados técnicos selecionados</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div className="cat-veh-thumb" style={{ width: 64, height: 64 }}>
                    {mainImage(selected)
                      ? <img src={mainImage(selected)} alt={selected.modelo} loading="lazy" />
                      : <i className="ph-bold ph-car-profile" />}
                  </div>
                  <div>
                    <strong>{selected.modelo} {selected.versao}</strong>
                    <div className="mf-lbl">{selected.ano_modelo} · {selected.categoria_principal}</div>
                  </div>
                </div>
                <div className="m-grid">
                  <div><div className="mf-lbl">Modelo</div><div className="mf-val">{selected.modelo}</div></div>
                  <div><div className="mf-lbl">Versão</div><div className="mf-val">{selected.versao}</div></div>
                  <div><div className="mf-lbl">Ano</div><div className="mf-val">{selected.ano_modelo}</div></div>
                  <div><div className="mf-lbl">Motor</div><div className="mf-val">{selected.motorizacao.descricao || 'Não informado'}</div></div>
                </div>
              </div>
              <div className="m-sec">
                <div className="m-sec-title">Dados comerciais</div>
                <div className="m-grid">
                  <label>Código interno<input required minLength={2} value={form.codigo} onChange={(event) => update('codigo', event.target.value)} /></label>
                  <label>Condição<select value={form.condicao} onChange={(event) => update('condicao', event.target.value)}><option value="NOVO">Novo</option><option value="SEMINOVO">Seminovo</option></select></label>
                  <label>Preço de venda<input required min="0" type="number" step="0.01" value={form.preco} onChange={(event) => update('preco', event.target.value)} /></label>
                  <label>
                    Cor
                    {selected.cores.length > 0 ? (
                      <select value={form.cor} onChange={(event) => update('cor', event.target.value)}>
                        {selected.cores.map((cor) => (
                          <option key={cor.nome} value={cor.nome}>{cor.nome}</option>
                        ))}
                      </select>
                    ) : (
                      <input required value={form.cor} onChange={(event) => update('cor', event.target.value)} placeholder="Cor não informada pelo catálogo" />
                    )}
                  </label>
                  <label>Quantidade<input required min="0" type="number" value={form.quantidade} onChange={(event) => update('quantidade', event.target.value)} /></label>
                  <label>Quilometragem<input value={form.km} onChange={(event) => update('km', event.target.value)} placeholder="Ex.: 0 km" /></label>
                </div>
                <label>Status<input value={form.status} onChange={(event) => update('status', event.target.value)} /></label>
                <label>Opcionais <span>(separados por vírgula)</span><textarea value={form.opcionais} onChange={(event) => update('opcionais', event.target.value)} /></label>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-sec" onClick={() => setSelected(null)}>Voltar</button>
                <button type="submit" className="btn-prim" disabled={saving}>{saving ? 'Adicionando...' : 'Adicionar ao estoque'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
