import { requireAdmin } from "@/lib/auth-utils";

const CreateCategoryPage = async () => {
  await requireAdmin();

  return <div>CreateCategoryPage</div>;
};

export default CreateCategoryPage;
