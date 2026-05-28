import "server-only";

import { TRPCError } from "@trpc/server";

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

export const rethrowBannerWriteError = (
  error: unknown,
  fallbackMessage: string,
): never => {
  if (error instanceof TRPCError) throw error;

  const code = getDbErrorCode(error);
  if (code === "23503") {
    throw new TRPCError({
      code: "CONFLICT",
      message:
        "Não foi possível concluir a operação porque uma imagem relacionada não existe",
    });
  }

  if (code === "23514") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Os dados do banner violam uma regra de validação de conteúdo",
    });
  }

  console.error(fallbackMessage, error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: fallbackMessage,
  });
};
