import { redirect } from "next/navigation";

const OrgAdminPage = async ({ params }: { params: Promise<{ orgSlug: string }> }) => {
  const { orgSlug } = await params;
  redirect(`/org/${orgSlug}/general`);
};

export default OrgAdminPage;
