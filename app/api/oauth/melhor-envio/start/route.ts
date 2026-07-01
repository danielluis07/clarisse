import { cookies } from "next/headers";
import { getCurrentSession } from "@/lib/auth-utils";
import { buildMelhorEnvioAuthorizeUrl } from "@/lib/melhor-envio";
import { OAUTH_STATE_COOKIE } from "@/modules/shipping/constants";

export const runtime = "nodejs";

/**
 * Kicks off the Melhor Envio OAuth flow. Admin-only. Sets a short-lived state
 * cookie (CSRF protection) and redirects the browser to the authorization
 * screen. The "Conectar Melhor Envio" button in the admin links here.
 */
export async function GET() {
  const session = await getCurrentSession();

  if (!session || session.user.role !== "admin") {
    return new Response("Acesso restrito ao administrador.", { status: 403 });
  }

  const state = crypto.randomUUID();

  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  try {
    return Response.redirect(buildMelhorEnvioAuthorizeUrl(state), 302);
  } catch (error) {
    console.error("Failed to build Melhor Envio authorize URL", error);
    return new Response(
      "Integração Melhor Envio não configurada (verifique as variáveis de ambiente).",
      { status: 500 },
    );
  }
}
