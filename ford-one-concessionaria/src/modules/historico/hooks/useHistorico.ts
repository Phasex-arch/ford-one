/**
 * @file useHistorico.ts
 * @module historico
 * @description Hook de estado e lógica da tela de Histórico.
 *
 * Responsabilidades:
 * - Escuta o CustomEvent 'ford:selectCliente' disparado pelo GlobalSearch
 *   e pela tela de Clientes para abrir o histórico de um cliente específico
 * - Mantém o cliente selecionado e sua lista de veículos
 * - Controla abertura/fechamento do VehicleModal
 * - Fornece a função voltar() para retornar à listagem de clientes
 *
 * selectedCliente e veiculos são derivados de selectedId — sem duplicação de estado.
 * O VehicleModal acessa o veículo pelo selectedId + selectedVehicleId via service.
 */

import { useState, useEffect, useCallback } from 'react';
import { getVeiculosCliente } from '../services/historico.service';
import { clientesStore, useStore } from '../../../shared/api/cache';
import type { Veiculo, Cliente } from '../../../types/global.types';

export function useHistorico() {
  const clientes = useStore(clientesStore);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setSelectedId(id);
      setSelectedVehicleId(null);
    };
    window.addEventListener('ford:selectCliente', handler);
    return () => window.removeEventListener('ford:selectCliente', handler);
  }, []);

  const selectedCliente: Cliente | undefined = selectedId
    ? clientes.find(c => c.id === selectedId)
    : undefined;

  const veiculos: Veiculo[] = selectedId ? getVeiculosCliente(selectedId) : [];

  const openVehicleModal = useCallback((cid: string, vid: string) => {
    setSelectedId(cid);
    setSelectedVehicleId(vid);
    setVehicleModalOpen(true);
  }, []);

  const selectedVeiculo: Veiculo | undefined = selectedId && selectedVehicleId
    ? getVeiculosCliente(selectedId).find(v => v.id === selectedVehicleId)
    : undefined;

  const voltar = useCallback(() => {
    setSelectedId(null);
  }, []);

  return {
    selectedId, selectedCliente, veiculos,
    openVehicleModal, selectedVeiculo, vehicleModalOpen, setVehicleModalOpen,
    voltar,
  };
}
