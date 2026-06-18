import { redirectIfNotAuthenticated } from "@/utils/authRedirect";

export const DefaultAuthenticatedLayout = async ({ children }: LayoutProps<"/">) => {
  await redirectIfNotAuthenticated();
  return children;
};
