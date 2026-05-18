"use client";

import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient, getErrorMessage } from "@/lib/auth-client";
import { signInInput } from "@/validations/auth";
import { cn } from "@/lib/utils";

type FormValues = z.infer<typeof signInInput>;

export const LoginForm = ({ nextPath }: { nextPath?: string }) => {
  const { signIn } = authClient;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(signInInput),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (value: FormValues) => {
    await signIn.email(
      { email: value.email, password: value.password },
      {
        onRequest: () => setIsLoading(true),
        onSuccess: (ctx) => {
          setIsLoading(false);
          const fallback =
            ctx.data.user.role === "admin" ? "/admin" : "/account";
          router.push(nextPath ?? fallback);
          router.refresh();
        },
        onError: (ctx) => {
          setIsLoading(false);
          toast.error(getErrorMessage(ctx.error.code, "ptBr"));
        },
      },
    );
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader className="items-center justify-items-center gap-2 px-8 pt-8 text-center">
        <Link
          href="/"
          aria-label="Clarisse"
          className="mb-2 inline-flex justify-center outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80">
          <Image
            src="/images/logo.png"
            alt="Clarisse"
            width={220}
            height={110}
            priority
            className="h-auto w-40"
          />
        </Link>
        <CardTitle className="font-heading text-3xl font-normal tracking-tight">
          Bem-vindo de volta
        </CardTitle>
        <CardDescription>
          Entre com suas credenciais para acessar o painel.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                aria-invalid={!!errors.email}
                disabled={isLoading}
                {...register("email")}
              />
              <FieldError errors={errors.email ? [errors.email] : undefined} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  disabled={isLoading}
                  className="pr-9"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  tabIndex={-1}
                  className={cn(
                    "absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground",
                    isLoading && "pointer-events-none opacity-60",
                  )}>
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <FieldError
                errors={errors.password ? [errors.password] : undefined}
              />
            </Field>

            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full"
              isLoading={isLoading}>
              Entrar
            </Button>
          </FieldGroup>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ainda não tem uma conta?{" "}
          <Link
            href="/register"
            className={cn(
              "font-medium text-foreground underline-offset-4 hover:underline",
              isLoading && "pointer-events-none opacity-60",
            )}>
            Criar conta
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};
