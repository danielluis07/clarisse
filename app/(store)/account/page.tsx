import { requireUser } from "@/lib/auth-utils";

const AccountPage = async () => {
  await requireUser();

  return (
    <div>
      <p>Account Page</p>
    </div>
  );
};

export default AccountPage;
