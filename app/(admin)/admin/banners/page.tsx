import { requireAdmin } from "@/lib/auth-utils";

const BannersPage = async () => {
  await requireAdmin();

  return <div>BannersPage</div>;
};

export default BannersPage;
