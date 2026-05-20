import { TRPCError } from "@trpc/server";

/**
 * Extract database error code from error object
 */
export const getDbErrorCode = (error: unknown) => {
  if (typeof error !== "object" || error === null) return undefined;
  if ("code" in error && typeof error.code === "string") return error.code;
  if (
    "cause" in error &&
    typeof error.cause === "object" &&
    error.cause !== null &&
    "code" in error.cause &&
    typeof error.cause.code === "string"
  ) {
    return error.cause.code;
  }
  return undefined;
};

/**
 * Rethrow database errors as TRPC errors with user-friendly messages
 */
export const rethrowProductWriteError = (
  error: unknown,
  fallbackMessage: string,
): never => {
  if (error instanceof TRPCError) throw error;

  const code = getDbErrorCode(error);
  if (code === "23505") {
    throw new TRPCError({
      code: "CONFLICT",
      message:
        "Já existe um produto ou variante com um identificador único informado",
    });
  }

  if (code === "23503") {
    throw new TRPCError({
      code: "CONFLICT",
      message:
        "Não foi possível concluir a operação porque este produto possui referências relacionadas",
    });
  }

  if (code === "23514") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Os dados do produto violam uma regra de validação do catálogo",
    });
  }

  console.error(fallbackMessage, error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: fallbackMessage,
  });
};
