import { ConfirmProvider } from "@/providers/confirm-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfirmProvider>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <AdminHeader />
          <main className="p-4 font-admin" data-section="admin">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ConfirmProvider>
  );
}
