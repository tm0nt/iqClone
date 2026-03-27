/**
 * Typed API error used across services.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(msg: string) {
    return new ApiError(msg, 400);
  }

  static unauthorized(msg = "Não autenticado") {
    return new ApiError(msg, 401);
  }

  static notFound(msg: string) {
    return new ApiError(msg, 404);
  }

  static internal(msg = "Erro interno do servidor") {
    return new ApiError(msg, 500);
  }
}
