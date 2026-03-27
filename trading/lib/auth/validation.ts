/**
 * Utilitários de validação para formulários de autenticação
 *
 * Fornece funções para validar campos de formulário comuns.
 */

/**
 * Valida o formato de um endereço de email
 *
 * @param email - Email a ser validado
 * @returns boolean indicando se o email é válido
 */
export function validateEmail(email: string): boolean {
  // Expressão regular para validação básica de email
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Valida a força de uma senha
 *
 * @param password - Senha a ser validada
 * @returns boolean indicando se a senha atende aos requisitos mínimos
 */
export function validatePassword(password: string): boolean {
  // Requisito mínimo: pelo menos 8 caracteres
  // Em um ambiente de produção, adicionaria mais requisitos de complexidade
  return password.length >= 8;
}

/**
 * Verifica se duas senhas coincidem
 *
 * @param password - Senha principal
 * @param confirmPassword - Confirmação da senha
 * @returns boolean indicando se as senhas coincidem
 */
export function passwordsMatch(
  password: string,
  confirmPassword: string,
): boolean {
  return password === confirmPassword;
}

/**
 * Valida se um nome está completo (nome e sobrenome)
 *
 * @param name - Nome a ser validado
 * @returns boolean indicando se o nome está completo
 */
export function validateFullName(name: string): boolean {
  // Verifica se há pelo menos dois nomes separados por espaço
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 && parts[0].length > 0 && parts[1].length > 0;
}
