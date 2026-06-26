import { z } from "zod";

const trimmedString = z.string().trim();

const optionalTrimmedString = (max = 160) =>
  trimmedString
    .max(max, { message: `O campo deve ter no máximo ${max} caracteres.` })
    .optional()
    .transform((value) => (value ? value : null));

export const accountAddressInput = z.object({
  label: trimmedString
    .min(2, { message: "O rótulo deve ter pelo menos 2 caracteres." })
    .max(40, { message: "O rótulo deve ter no máximo 40 caracteres." }),
  recipient: trimmedString
    .min(2, {
      message: "O nome do destinatário deve ter pelo menos 2 caracteres.",
    })
    .max(120, {
      message: "O nome do destinatário deve ter no máximo 120 caracteres.",
    }),
  postalCode: trimmedString
    .min(8, { message: "O CEP deve ter pelo menos 8 caracteres." })
    .max(16, { message: "O CEP deve ter no máximo 16 caracteres." }),
  addressLine1: trimmedString
    .min(2, { message: "O endereço deve ter pelo menos 2 caracteres." })
    .max(160, { message: "O endereço deve ter no máximo 160 caracteres." }),
  number: trimmedString
    .min(1, { message: "O número é obrigatório." })
    .max(20, { message: "O número deve ter no máximo 20 caracteres." }),
  complement: optionalTrimmedString(120),
  neighborhood: trimmedString
    .min(2, { message: "O bairro deve ter pelo menos 2 caracteres." })
    .max(80, { message: "O bairro deve ter no máximo 80 caracteres." }),
  city: trimmedString
    .min(2, { message: "A cidade deve ter pelo menos 2 caracteres." })
    .max(80, { message: "A cidade deve ter no máximo 80 caracteres." }),
  state: trimmedString
    .min(2, { message: "O estado deve ter 2 caracteres (sigla)." })
    .max(2, { message: "O estado deve ter 2 caracteres (sigla)." })
    .transform((value) => value.toUpperCase()),
  phone: optionalTrimmedString(32),
  isDefault: z.boolean({
    error: "O campo isDefault deve ser verdadeiro ou falso.",
  }),
});

export type AccountAddressInput = z.input<typeof accountAddressInput>;
export type AccountAddressOutput = z.output<typeof accountAddressInput>;
