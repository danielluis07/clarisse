"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Plug, Save, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { centsToReais, formatReaisInput } from "@/lib/utils";
import {
  useDisconnectMelhorEnvio,
  useShippingSettingsSuspense,
  useUpdateShippingSettings,
} from "@/modules/shipping/hooks";
import {
  updateShippingSettingsInput,
  type ShippingSettingsFormInput,
  type UpdateShippingSettingsInput,
} from "@/modules/shipping/validations";
import { env } from "@/lib/env";

const baseUrl =
  process.env.NODE_ENV === "development"
    ? "https://8284-2804-30c-d70-8200-30a3-e54a-660f-c5b8.ngrok-free.app"
    : env.NEXT_PUBLIC_APP_URL;

const toReaisDisplay = (value: string | number | null | undefined) =>
  value == null || value === "" ? "" : centsToReais(Number(value));

const ConnectionCard = ({
  integration,
}: {
  integration: ReturnType<
    typeof useShippingSettingsSuspense
  >["data"]["integration"];
}) => {
  const disconnect = useDisconnectMelhorEnvio();

  const handleDisconnect = async () => {
    try {
      await disconnect.mutateAsync();
      toast.success("Conta do Melhor Envio desconectada.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao desconectar.",
      );
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="font-admin">Conexão Melhor Envio</CardTitle>
        <CardDescription>
          Ambiente: <strong>{integration.environment}</strong>. A autorização é
          feita uma vez; o token é renovado automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm">
          {integration.connected && !integration.expired ? (
            <>
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>
                Conectado
                {integration.accountName ? ` — ${integration.accountName}` : ""}
              </span>
            </>
          ) : (
            <>
              <XCircle className="size-4 text-muted-foreground" />
              <span>
                {integration.expired
                  ? "Token expirado — reconecte a conta."
                  : "Não conectado."}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant={integration.connected ? "outline" : "default"}>
            <Link href={`${baseUrl}/api/oauth/melhor-envio/start`}>
              <Plug data-icon="inline-start" />
              {integration.connected ? "Reconectar" : "Conectar Melhor Envio"}
            </Link>
          </Button>
          {integration.connected && (
            <Button
              type="button"
              variant="destructive"
              disabled={disconnect.isPending}
              onClick={handleDisconnect}>
              Desconectar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const ShippingSettingsView = () => {
  const { data } = useShippingSettingsSuspense();
  const updateSettings = useUpdateShippingSettings();
  const searchParams = useSearchParams();
  const handledCallback = useRef(false);

  useEffect(() => {
    if (handledCallback.current) return;
    const status = searchParams.get("me");
    if (!status) return;

    handledCallback.current = true;
    if (status === "connected") {
      toast.success("Melhor Envio conectado com sucesso.");
    } else if (status === "error") {
      toast.error("Não foi possível conectar o Melhor Envio. Tente novamente.");
    }
  }, [searchParams]);

  const { settings } = data;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingSettingsFormInput, unknown, UpdateShippingSettingsInput>({
    resolver: zodResolver(updateShippingSettingsInput),
    defaultValues: {
      originPostalCode: settings.originPostalCode ?? "",
      senderName: settings.senderName ?? "",
      senderDocument: settings.senderDocument ?? "",
      senderPhone: settings.senderPhone ?? "",
      senderEmail: settings.senderEmail ?? "",
      senderAddressLine1: settings.senderAddressLine1 ?? "",
      senderNumber: settings.senderNumber ?? "",
      senderComplement: settings.senderComplement ?? "",
      senderNeighborhood: settings.senderNeighborhood ?? "",
      senderCity: settings.senderCity ?? "",
      senderState: settings.senderState ?? "",
      defaultPackageHeightCm: settings.defaultPackageHeightCm,
      defaultPackageWidthCm: settings.defaultPackageWidthCm,
      defaultPackageLengthCm: settings.defaultPackageLengthCm,
      defaultPackageWeightGrams: settings.defaultPackageWeightGrams,
      freeShippingEnabled: settings.freeShippingEnabled,
      freeShippingThresholdCents: settings.freeShippingThresholdCents,
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await updateSettings.mutateAsync(values);
      toast.success("Configurações de envio salvas.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as configurações.",
      );
    }
  });

  const isSaving = updateSettings.isPending;

  const textField = (
    name: keyof ShippingSettingsFormInput,
    label: string,
    placeholder?: string,
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, ...field } }) => (
        <Field data-invalid={!!errors[name]}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            id={name}
            placeholder={placeholder}
            autoComplete="off"
            aria-invalid={!!errors[name]}
            disabled={isSaving}
            value={(value as string) ?? ""}
            {...field}
          />
          <FieldError errors={errors[name] ? [errors[name]!] : undefined} />
        </Field>
      )}
    />
  );

  const numberField = (
    name: keyof ShippingSettingsFormInput,
    label: string,
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, ...field } }) => (
        <Field data-invalid={!!errors[name]}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            id={name}
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            aria-invalid={!!errors[name]}
            disabled={isSaving}
            value={(value as number | undefined) ?? ""}
            onChange={(event) =>
              onChange(
                event.target.value === ""
                  ? undefined
                  : event.target.valueAsNumber,
              )
            }
            {...field}
          />
          <FieldError errors={errors[name] ? [errors[name]!] : undefined} />
        </Field>
      )}
    />
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Configurações de envio
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Conecte o Melhor Envio e defina origem, embalagem padrão e a regra de
          frete grátis usadas no cálculo do frete.
        </p>
      </header>

      <ConnectionCard integration={data.integration} />

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="font-admin">Origem e remetente</CardTitle>
          <CardDescription>
            CEP de origem usado na cotação e dados do remetente para as
            etiquetas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              {textField("originPostalCode", "CEP de origem", "01001-000")}
              {textField("senderName", "Nome do remetente", "Clarisse")}
              {textField("senderDocument", "CPF/CNPJ")}
              {textField("senderPhone", "Telefone")}
              {textField("senderEmail", "E-mail")}
              {textField("senderAddressLine1", "Endereço")}
              {textField("senderNumber", "Número")}
              {textField("senderComplement", "Complemento")}
              {textField("senderNeighborhood", "Bairro")}
              {textField("senderCity", "Cidade")}
              {textField("senderState", "UF", "SP")}
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="font-admin">Embalagem padrão</CardTitle>
          <CardDescription>
            Usada quando um produto não tem dimensões próprias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-4">
              {numberField("defaultPackageHeightCm", "Altura (cm)")}
              {numberField("defaultPackageWidthCm", "Largura (cm)")}
              {numberField("defaultPackageLengthCm", "Comprimento (cm)")}
              {numberField("defaultPackageWeightGrams", "Peso (g)")}
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="font-admin">Frete grátis</CardTitle>
          <CardDescription>
            Acima do limite, a loja absorve o frete e o cliente paga R$ 0.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              control={control}
              name="freeShippingEnabled"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id="freeShippingEnabled"
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    disabled={isSaving}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="freeShippingEnabled">
                      Habilitar frete grátis por valor
                    </FieldLabel>
                    <FieldDescription>
                      Desligue para sempre cobrar o frete cotado.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="freeShippingThresholdCents"
              render={({ field }) => (
                <Field
                  data-invalid={!!errors.freeShippingThresholdCents}
                  className="sm:max-w-xs">
                  <FieldLabel htmlFor="freeShippingThresholdCents">
                    Limite para frete grátis
                  </FieldLabel>
                  <Input
                    id="freeShippingThresholdCents"
                    type="text"
                    inputMode="decimal"
                    placeholder="R$ 800,00"
                    aria-invalid={!!errors.freeShippingThresholdCents}
                    disabled={isSaving}
                    value={toReaisDisplay(field.value)}
                    onChange={(event) => formatReaisInput(event, field)}
                  />
                  <FieldError
                    errors={
                      errors.freeShippingThresholdCents
                        ? [errors.freeShippingThresholdCents]
                        : undefined
                    }
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="w-40">
          {isSaving ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          {isSaving ? "Salvando" : "Salvar"}
        </Button>
      </div>
    </form>
  );
};
