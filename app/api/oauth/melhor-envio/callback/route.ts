import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCurrentSession } from "@/lib/auth-utils";
import { env } from "@/lib/env";
import { connectMelhorEnvio } from "@/modules/shipping/server-utils";
import { OAUTH_STATE_COOKIE } from "@/modules/shipping/constants";

export const runtime = "nodejs";

const SETTINGS_PATH = "/admin/settings/shipping";

const redirectToSettings = (status: "connected" | "error", reason?: string) => {
  const url = new URL(SETTINGS_PATH, env.NEXT_PUBLIC_APP_URL);
  url.searchParams.set("me", status);
  if (reason) url.searchParams.set("reason", reason);
  return Response.redirect(url.toString(), 302);
};

/**
 * OAuth callback. Validates the CSRF state cookie, exchanges the authorization
 * code for tokens, persists them and bounces back to the shipping settings.
 */
export async function GET(request: NextRequest) {
  const session = await getCurrentSession();

  if (!session || session.user.role !== "admin") {
    return new Response("Acesso restrito ao administrador.", { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);

  if (searchParams.get("error")) {
    return redirectToSettings("error", "denied");
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectToSettings("error", "invalid_state");
  }

  try {
    await connectMelhorEnvio(code);
    return redirectToSettings("connected");
  } catch (error) {
    console.error("Melhor Envio OAuth callback failed", error);
    return redirectToSettings("error", "exchange_failed");
  }
}
