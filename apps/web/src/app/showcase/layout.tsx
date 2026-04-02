import { connection } from "next/server";

import { UIProvider } from "@/ui";
import { getTheme } from "@/ui/server";

const ShowcaseLayout = async ({ children }: { children: React.ReactNode }) => {
  await connection();
  const theme = await getTheme();

  return <UIProvider value={theme}>{children}</UIProvider>;
};

export default ShowcaseLayout;
