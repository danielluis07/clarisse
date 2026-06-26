import { z } from "zod";

const trimmedString = z.string().trim();

const optionalTrimmedString = (max = 160) =>
  trimmedString
    .max(max, { message: `O campo deve ter no máximo ${max} caracteres.` })
    // `nullish` (not `optional`) so the schema accepts the `null` values the
    // form emits for empty optional fields and re-validates them server-side.
    .nullish()
    .transform((value) => (value ? value : null));

const addressId = trimmedString.min(1, { message: "Endereço inválido." });

/**
 * Brazilian phone with 10 or 11 digits. Accepts an empty value (cleared by the
 * user) and normalizes it to `null`.
 */
const phoneField = trimmedString
  .regex(/^\d{10,11}$/, {
    message: "O telefone deve conter 10 ou 11 dígitos.",
  })
  .or(z.literal(""))
  .nullish()
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
  isDefault: z.boolean({
    error: "O campo isDefault deve ser verdadeiro ou falso.",
  }),
});

export type AccountAddressInput = z.input<typeof accountAddressInput>;
export type AccountAddressOutput = z.output<typeof accountAddressInput>;

export const createAddressInput = accountAddressInput;

export const updateAddressInput = accountAddressInput.extend({
  id: addressId,
});

export const deleteAddressInput = z.object({
  id: addressId,
});

export const updateProfileInput = z.object({
  phone: phoneField,
});

export type UpdateProfileOutput = z.output<typeof updateProfileInput>;
