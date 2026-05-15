import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Entrar | Clarisse",
};

const LoginPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect(session.user.role === "admin" ? "/admin" : "/");
  }

  return <LoginForm />;
};

export default LoginPage;
