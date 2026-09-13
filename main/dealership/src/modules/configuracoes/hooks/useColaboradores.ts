/**
 * @file useColaboradores.ts
 * @module configuracoes
 * @description Hook de estado e lógica da seção "Equipe" (gestão de acesso
 * de colaboradores) dentro da tela de Configurações.
 *
 * Gerencia: busca paginada real, modal de criar/editar, e a ativação/
 * desativação de acesso (reativar = PATCH ativo:true, desativar = DELETE
 * real, que no backend é soft-delete — o colaborador continua na lista).
 */

import { useState, useCallback, useEffect } from 'react';
import { friendlyApiMessage, type PaginationMeta } from '../../../shared/api/client';
import {
  fetchColaboradores,
  createColaborador,
  updateColaborador,
  desativarColaborador,
  type Colaborador,
  type CreateColaboradorInput,
  type UpdateColaboradorInput,
} from '../services/colaboradores.service';

// 50 cobre o quadro real de qualquer concessionária de porte único — mantém
// os chips de estatística (total/ativos/admins) corretos numa única página
// sem precisar de um endpoint de agregação separado.
const PAGE_SIZE = 50;

export function useColaboradores(ativo: boolean) {
  const [page, setPage] = useState(1);
  const [source, setSource] = useState<Colaborador[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Colaborador | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Colaborador | null>(null);

  const load = useCallback(() => {
    if (!ativo) { setLoading(false); return; }
    setLoading(true);
    setError('');
    fetchColaboradores({ page, limit: PAGE_SIZE })
      .then(res => { setSource(res.data); setPagination(res.pagination); })
      .catch(e => { setError(friendlyApiMessage(e)); setSource([]); setPagination(null); })
      .finally(() => setLoading(false));
  }, [page, ativo]);

  useEffect(() => { load(); }, [load]);

  const salvarNovo = useCallback(
    (dados: CreateColaboradorInput, showToast: (m: string, t?: 'success' | 'warning') => void) => {
      createColaborador(dados).then(novo => {
        setModalOpen(false);
        load();
        showToast(`Acesso criado para ${novo.nome.split(' ')[0]}.`, 'success');
      }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
    },
    [load],
  );

  const salvarEdicao = useCallback(
    (dados: UpdateColaboradorInput, showToast: (m: string, t?: 'success' | 'warning') => void) => {
      if (!editing) return;
      updateColaborador(editing.id, dados).then(atualizado => {
        setEditing(null);
        load();
        showToast(`Dados de ${atualizado.nome.split(' ')[0]} atualizados.`, 'success');
      }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
    },
    [editing, load],
  );

  const confirmarDesativacao = useCallback(
    (showToast: (m: string, t?: 'success' | 'warning') => void) => {
      if (!deactivateTarget) return;
      const nome = deactivateTarget.nome;
      desativarColaborador(deactivateTarget.id).then(() => {
        setDeactivateTarget(null);
        load();
        showToast(`Acesso de ${nome.split(' ')[0]} desativado.`, 'success');
      }).catch(e => {
        setDeactivateTarget(null);
        showToast(friendlyApiMessage(e), 'warning');
      });
    },
    [deactivateTarget, load],
  );

  const reativar = useCallback(
    (colaborador: Colaborador, showToast: (m: string, t?: 'success' | 'warning') => void) => {
      updateColaborador(colaborador.id, { ativo: true }).then(() => {
        load();
        showToast(`Acesso de ${colaborador.nome.split(' ')[0]} reativado.`, 'success');
      }).catch(e => showToast(friendlyApiMessage(e), 'warning'));
    },
    [load],
  );

  return {
    colaboradores: source, loading, error, page, setPage, pagination,
    modalOpen, setModalOpen, editing, setEditing,
    salvarNovo, salvarEdicao,
    deactivateTarget, setDeactivateTarget, confirmarDesativacao, reativar,
  };
}
