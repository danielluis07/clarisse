import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth-utils";

const AdminPage = async () => {
  await requireAdmin();

  return (
    <div>
      <h1>This is font inter</h1>
      <p>This is font inter too</p>
      <Card>
        <p>This is a card</p>
      </Card>
      <Button>Click me</Button>
    </div>
  );
};

export default AdminPage;
