import { z } from "zod";

export const signUpInput = z
  .object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z.email("Insira um email válido"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    repeat_password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres"),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: "As senhas não coincidem",
    path: ["repeat_password"],
  });

export const signInInput = z.object({
  email: z.email("Insira um email válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export const changePasswordInput = z
  .object({
    current_password: z.string().min(1, "Informe sua senha atual"),
    new_password: z
      .string()
      .min(8, "A nova senha deve ter pelo menos 8 caracteres"),
    repeat_new_password: z
      .string()
      .min(8, "A nova senha deve ter pelo menos 8 caracteres"),
  })
  .refine((data) => data.new_password === data.repeat_new_password, {
    message: "As senhas não coincidem",
    path: ["repeat_new_password"],
  });
