import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";
import { getSafeNextPath } from "@/lib/utils";

export const metadata = {
  title: "Entrar | Clarisse",
};

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[] | undefined;
  }>;
}) => {
  const { next } = await searchParams;
  const nextPath = getSafeNextPath(next);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect(
      nextPath ?? (session.user.role === "admin" ? "/admin" : "/account"),
    );
  }

  return <LoginForm nextPath={nextPath} />;
};

export default LoginPage;
