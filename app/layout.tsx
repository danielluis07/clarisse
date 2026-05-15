import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { inter, jost, cormorantGaramond } from "@/fonts";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Clarisse | Moda feminina",
  description:
    "Moda feminina minimalista premium. Blazers, calças de alfaiataria, vestidos minimalistas, camisas oversized e bolsas sofisticadas.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn(
        "h-full antialiased font-sans",
        cormorantGaramond.variable,
        jost.variable,
        inter.variable,
      )}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
