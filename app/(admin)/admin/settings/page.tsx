import { redirect } from "next/navigation";

const SettingsPage = () => {
  redirect("/admin/settings/shipping");
};

export default SettingsPage;
