/**
 * @file useHistorico.ts
 * @module historico
 * @description Hook de estado e lógica da tela de Histórico.
 *
 * Responsabilidades:
 * - Escuta o CustomEvent 'ford:selectCliente' disparado pela tela de Clientes,
 *   pela busca global e pelos chips "Acessados Hoje" desta própria tela
 * - Busca o cliente (GET /clientes/:id) e seus veículos
 *   (GET /clientes/:id/veiculos) sempre que o id selecionado muda
 * - Controla abertura/fechamento do VehicleModal
 * - Fornece a função voltar() para retornar à listagem de clientes
 *
 * selectedCliente e veiculos são buscados da API real — nada vem mais de
 * data/clientes.data.ts ou data/veiculos.data.ts.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchVeiculosCliente } from '../services/historico.service';
import { fetchClienteById } from '../../clientes/services/clientes.service';
import { friendlyApiMessage } from '../../../shared/api/client';
import type { Veiculo, Cliente } from '../../../types/global.types';

export function useHistorico() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setSelectedId(id);
      setSelectedVehicleId(null);
    };
    window.addEventListener('ford:selectCliente', handler);
    return () => window.removeEventListener('ford:selectCliente', handler);
  }, []);

  useEffect(() => {
    if (!selectedId) { setSelectedCliente(null); setVeiculos([]); return; }
    setLoading(true);
    setError('');
    Promise.all([fetchClienteById(selectedId), fetchVeiculosCliente(selectedId)])
      .then(([cliente, veiculosCliente]) => {
        setSelectedCliente(cliente);
        setVeiculos(veiculosCliente);
      })
      .catch(e => {
        setError(friendlyApiMessage(e));
        setSelectedCliente(null);
        setVeiculos([]);
      })
      .finally(() => setLoading(false));
  }, [selectedId]);

  const openVehicleModal = useCallback((cid: string, vid: string) => {
    setSelectedId(cid);
    setSelectedVehicleId(vid);
    setVehicleModalOpen(true);
  }, []);

  const selectedVeiculo: Veiculo | undefined = selectedVehicleId
    ? veiculos.find(v => v.id === selectedVehicleId)
    : undefined;

  const voltar = useCallback(() => {
    setSelectedId(null);
  }, []);

  return {
    selectedId, selectedCliente, veiculos, loading, error,
    openVehicleModal, selectedVeiculo, vehicleModalOpen, setVehicleModalOpen,
    voltar,
  };
}
