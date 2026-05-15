export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="relative flex min-h-screen flex-col bg-background font-body"
      data-section="auth">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--foreground)_6%,transparent)_0%,transparent_45%),radial-gradient(circle_at_bottom,color-mix(in_oklch,var(--foreground)_4%,transparent)_0%,transparent_40%)]" />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">{children}</div>

        <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Moda feminina · Brasil
        </p>
      </div>
    </main>
  );
}
