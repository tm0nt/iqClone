/**
 * Tipos relacionados à autenticação
 *
 * Define interfaces e tipos para o sistema de autenticação.
 */

/**
 * Interface para dados de usuário
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * Interface para credenciais de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface para dados de registro
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

/**
 * Interface para resposta de autenticação
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Tipo para estado de validação de campo
 */
export type ValidationState = boolean | null;

/**
 * Interface para erro de autenticação
 */
export interface AuthError {
  message: string;
  field?: string;
}
