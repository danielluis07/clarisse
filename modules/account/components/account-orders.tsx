import { Package } from "lucide-react";
import Link from "next/link";
import { AccountSectionHeading } from "@/modules/account/components/account-section-heading";
import { AccountEmpty } from "@/modules/account/components/account-empty";
import { OrderCard } from "@/modules/account/components/order-card";
import { MOCK_ORDERS } from "@/modules/account/constants";

export const AccountOrders = () => {
  const orders = MOCK_ORDERS;

  return (
    <div className="space-y-8">
      <AccountSectionHeading
        eyebrow="Histórico"
        title="Pedidos"
        description="Acompanhe o status, o rastreio e os detalhes de cada compra."
      />

      {orders.length === 0 ? (
        <AccountEmpty
          icon={Package}
          title="Nenhum pedido por aqui."
          description="Quando você finalizar a sua primeira compra, ela aparecerá nesta página com o rastreio completo."
          action={
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center bg-foreground px-8 text-[11px] uppercase tracking-[0.24em] text-background transition-opacity hover:opacity-90">
              Explorar o catálogo
            </Link>
          }
        />
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};
