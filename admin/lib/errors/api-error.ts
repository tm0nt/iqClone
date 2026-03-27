/**
 * Classe centralizada de erros da API (Admin).
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message = "Requisição inválida", details?: unknown) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Não autorizado") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Acesso negado") {
    return new ApiError(403, message);
  }

  static notFound(message = "Recurso não encontrado") {
    return new ApiError(404, message);
  }

  static internal(message = "Erro interno do servidor", details?: unknown) {
    return new ApiError(500, message, details);
  }

  toJSON() {
    return {
      error: this.message,
      statusCode: this.statusCode,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(error.toJSON(), { status: error.statusCode });
  }
  console.error("[API] Unhandled error:", error);
  return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
}
