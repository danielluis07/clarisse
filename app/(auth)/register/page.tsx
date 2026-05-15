import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Criar conta | Clarisse",
};

const RegisterPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect(session.user.role === "admin" ? "/admin" : "/");
  }

  return <RegisterForm />;
};

export default RegisterPage;
