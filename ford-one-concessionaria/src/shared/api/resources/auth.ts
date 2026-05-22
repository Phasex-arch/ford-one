/**
 * @file resources/auth.ts
 * @description Cliente das rotas POST /auth/login, POST /auth/register e GET /auth/me.
 */

import { http } from '../http';
import type { AuthResponseDto, AuthUserDto, ApiRole } from '../types';

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  registro: string;
  cargo: string;
  role?: ApiRole;
  senha: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponseDto> {
  const { data } = await http.post<AuthResponseDto>('/auth/login', payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponseDto> {
  const { data } = await http.post<AuthResponseDto>('/auth/register', payload);
  return data;
}

export async function me(): Promise<AuthUserDto> {
  const { data } = await http.get<AuthUserDto>('/auth/me');
  return data;
}
