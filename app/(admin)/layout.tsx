export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="p-6 font-admin" data-section="admin">
      {children}
    </main>
  );
}
