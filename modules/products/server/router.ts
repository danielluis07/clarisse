import "server-only";

import { createTRPCRouter } from "@/trpc/init";
import { productsAdminProcedures } from "@/modules/products/server/admin-procedures";
import { productsInventoryProcedures } from "@/modules/products/server/inventory-procedures";
import { productsStoreProcedures } from "@/modules/products/server/store-procedures";

export const productsRouter = createTRPCRouter({
  ...productsAdminProcedures,
  ...productsStoreProcedures,
  ...productsInventoryProcedures,
});
