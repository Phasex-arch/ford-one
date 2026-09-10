/**
 * @file can.spec.ts
 * @description A matriz de permissões do frontend.
 *
 * `can.ts` existe para não oferecer ao usuário uma ação que resultaria em 403.
 * Ele só vale se espelhar o `@Roles()` de cada controller — e a fonte da verdade
 * é `test/rbac.e2e-spec.ts` no backend. Divergência entre os dois é bug: ou a
 * tela esconde o que deveria mostrar, ou oferece o que vai falhar.
 */

import { describe, it, expect } from 'vitest';
import { can, PERMISSIONS, type Permission } from './can';
import type { AuthenticatedUser } from '../api/client';

const usuario = (role: AuthenticatedUser['role']): AuthenticatedUser =>
  ({ id: 'u', nome: 'Teste', email: 't@ford.com.br', role });

const ADMIN = usuario('ADMIN');
const GERENTE = usuario('GERENTE');
const FUNCIONARIO = usuario('FUNCIONARIO');

describe('can', () => {
  it('sem usuário autenticado, nada é permitido', () => {
    for (const acao of Object.keys(PERMISSIONS) as Permission[]) {
      expect(can(null, acao)).toBe(false);
    }
  });

  it('ADMIN pode tudo que está declarado', () => {
    for (const acao of Object.keys(PERMISSIONS) as Permission[]) {
      expect(can(ADMIN, acao)).toBe(true);
    }
  });

  const esperado: Array<[Permission, boolean, boolean]> = [
    // ação,                    GERENTE, FUNCIONARIO
    ['estoque:write',            true,   false],
    ['estoque:delete',           false,  false],
    ['metas:write',              true,   false],
    ['financiamentos:write',     true,   false],
    ['tecnicos:write',           true,   false],
    ['clientes:delete',          true,   false],
    ['leads:delete',             true,   false],
    ['servicos:delete',          true,   false],
    ['colaboradores:read',       true,   false],
    ['colaboradores:write',      false,  false],
    ['sync:run',                 false,  false],
  ];

  for (const [acao, gerente, funcionario] of esperado) {
    it(`${acao}: GERENTE=${gerente}, FUNCIONARIO=${funcionario}`, () => {
      expect(can(GERENTE, acao)).toBe(gerente);
      expect(can(FUNCIONARIO, acao)).toBe(funcionario);
    });
  }

  it('a tabela de testes cobre todas as permissões declaradas', () => {
    const declaradas = Object.keys(PERMISSIONS).sort();
    const testadas = esperado.map(([a]) => a).sort();
    expect(testadas).toEqual(declaradas);
  });
});
