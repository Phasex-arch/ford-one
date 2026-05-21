/**
 * Valida e-mail com regex padrão RFC.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida telefone brasileiro (8+ dígitos, aceita formatação).
 */
export function isValidPhone(phone: string): boolean {
  return /^[\d\s()\-+]{8,}$/.test(phone);
}

/**
 * Verifica se string tem ao menos N caracteres após trim.
 */
export function hasMinLength(value: string, min: number): boolean {
  return value.trim().length >= min;
}
