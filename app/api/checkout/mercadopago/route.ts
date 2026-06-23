import { ZodError } from "zod";
import {
  CheckoutError,
  createMercadoPagoCheckout,
} from "@/modules/checkout/server-utils";
import { createMercadoPagoCheckoutInput } from "@/modules/checkout/validations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = createMercadoPagoCheckoutInput.parse(payload);
    const checkout = await createMercadoPagoCheckout(input);

    return Response.json(checkout);
  } catch (error) {
    if (error instanceof ZodError) {
      console.warn("Invalid Mercado Pago checkout payload", {
        issueCount: error.issues.length,
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });

      return Response.json(
        {
          message: "Dados de checkout inválidos.",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    if (error instanceof CheckoutError) {
      console.warn("Mercado Pago checkout failed", {
        status: error.status,
        message: error.message,
      });

      return Response.json(
        {
          message: error.message,
        },
        { status: error.status },
      );
    }

    console.error("Mercado Pago checkout error", error);

    return Response.json(
      {
        message: "Não foi possível iniciar o checkout.",
      },
      { status: 500 },
    );
  }
}
