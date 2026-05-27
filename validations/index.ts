import { z } from "zod";

export const isoDate = z.iso.date({ message: "Data inválida" });
