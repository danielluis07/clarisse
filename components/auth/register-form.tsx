"use client";

import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
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
import { signUpInput } from "@/validations/auth";
import { cn } from "@/lib/utils";

type FormValues = z.infer<typeof signUpInput>;

export const RegisterForm = () => {
  const { signUp } = authClient;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const {
    control,
    handleSubmit,
  } = useForm<FormValues>({
    resolver: zodResolver(signUpInput),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      repeat_password: "",
    },
  });

  const onSubmit = async (value: FormValues) => {
    await signUp.email(
      {
        name: value.name,
        email: value.email,
        password: value.password,
      },
      {
        onRequest: () => setIsLoading(true),
        onSuccess: () => {
          setIsLoading(false);
          toast.success("Conta criada com sucesso!");
          router.push("/login");
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
          Criar uma conta
        </CardTitle>
        <CardDescription>
          Preencha seus dados para começar a usar o painel.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Nome</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Seu nome"
                    aria-invalid={fieldState.invalid}
                    disabled={isLoading}
                    {...field}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : undefined}
                  />
                </Field>
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    aria-invalid={fieldState.invalid}
                    disabled={isLoading}
                    {...field}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : undefined}
                  />
                </Field>
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Pelo menos 8 caracteres"
                      aria-invalid={fieldState.invalid}
                      disabled={isLoading}
                      className="pr-9"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
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
                    errors={
                      fieldState.error ? [fieldState.error] : undefined
                    }
                  />
                </Field>
              )}
            />

            <Controller
              name="repeat_password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="repeat_password">
                    Confirmar senha
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="repeat_password"
                      type={showRepeatPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repita a senha"
                      aria-invalid={fieldState.invalid}
                      disabled={isLoading}
                      className="pr-9"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRepeatPassword((s) => !s)}
                      aria-label={
                        showRepeatPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                      tabIndex={-1}
                      className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground">
                      {showRepeatPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <FieldError
                    errors={
                      fieldState.error ? [fieldState.error] : undefined
                    }
                  />
                </Field>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full"
              isLoading={isLoading}>
              Criar conta
            </Button>
          </FieldGroup>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className={cn(
              "font-medium text-foreground underline-offset-4 hover:underline",
              isLoading && "pointer-events-none opacity-50",
            )}>
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};
