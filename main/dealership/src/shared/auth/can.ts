/**
 * @file can.ts
 * @description Espelho no frontend do @Roles() de cada controller do backend.
 *
 * O backend continua sendo a autoridade — isto apenas evita oferecer ao usuário
 * uma ação que resultaria em 403. Ao mudar @Roles() em um controller, ajuste
 * a entrada correspondente aqui.
 */

import type { AuthenticatedUser } from '../api/client';

type Role = AuthenticatedUser['role'];

const ADMIN_GERENTE: Role[] = ['ADMIN', 'GERENTE'];

export const PERMISSIONS = {
  'estoque:write':        ADMIN_GERENTE,
  'estoque:delete':       ['ADMIN'],
  'metas:write':          ADMIN_GERENTE,
  'financiamentos:write': ADMIN_GERENTE,
  'tecnicos:write':       ADMIN_GERENTE,
  'clientes:delete':      ADMIN_GERENTE,
  'leads:delete':         ADMIN_GERENTE,
  'servicos:delete':      ADMIN_GERENTE,
  'colaboradores:read':   ADMIN_GERENTE,
  'colaboradores:write':  ['ADMIN'],
  'sync:run':             ['ADMIN'],
} satisfies Record<string, Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export const can = (user: AuthenticatedUser | null, action: Permission): boolean =>
  !!user && (PERMISSIONS[action] as Role[]).includes(user.role);
