import { redirect } from "next/navigation";

const AdminPage = () => {
  redirect("/admin/tenants");
};

export default AdminPage;
