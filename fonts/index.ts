import { Cormorant_Garamond, Inter, Jost } from "next/font/google";

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const jost = Jost({
  subsets: ["latin"],
  variable: "--font-body",
});

export const inter = Inter({ subsets: ["latin"], variable: "--font-admin" });
