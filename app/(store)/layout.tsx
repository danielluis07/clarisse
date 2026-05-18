import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="font-body flex min-h-screen flex-col bg-background text-foreground"
      data-section="store"
    >
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
