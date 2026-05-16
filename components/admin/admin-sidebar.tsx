import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import {
  Home,
  Images,
  Layers3,
  Package,
  Settings2,
  ShoppingBag,
  Tags,
  TicketPercent,
  Users,
} from "lucide-react";
import { SidebarItems } from "@/components/admin/sidebar-items";
import { SiderbarHeader } from "@/components/admin/sidebar-header";
import { LogOutButton } from "@/components/admin/log-out-button";

const items = [
  {
    title: "Início",
    url: "/",
    icon: <Home className="size-4" />,
  },
  {
    title: "Produtos",
    url: "/admin/products",
    icon: <Package className="size-4" />,
  },
  {
    title: "Categorias",
    url: "/admin/categories",
    icon: <Tags className="size-4" />,
  },
  {
    title: "Coleções",
    url: "/admin/collections",
    icon: <Layers3 className="size-4" />,
  },
  {
    title: "Pedidos",
    url: "/admin/orders",
    icon: <ShoppingBag className="size-4" />,
  },
  {
    title: "Clientes",
    url: "/admin/customers",
    icon: <Users className="size-4" />,
  },
  {
    title: "Cupons",
    url: "/admin/coupons",
    icon: <TicketPercent className="size-4" />,
  },
  {
    title: "Mídia",
    url: "/admin/media",
    icon: <Images className="size-4" />,
  },
  {
    title: "Configurações",
    url: "/admin/settings",
    icon: <Settings2 className="size-4" />,
  },
];

export function AdminSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SiderbarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, i) => (
                <SidebarItems key={i} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <LogOutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
