import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_CONFIG } from "@/modules/account/constants";
import type { OrderStatus } from "@/modules/checkout/types";

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = ORDER_STATUS_CONFIG[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-medium uppercase tracking-[0.12em]",
        config.className,
      )}>
      {config.label}
    </Badge>
  );
};
