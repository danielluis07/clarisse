export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="font-body" data-section="store">
      {children}
    </main>
  );
}
