import { ClientAnimate } from "@/components/utils/ClientAnimate";
import { UIProvider } from "@/ui";
import { DefaultThemeForcer } from "@/ui/DefaultThemeForcer";
import { assertTenantModerator } from "@/utils/auth";

import { ModerationSideMenu } from "./ModerationSideMenu";

const ModerationLayout = async ({ children, params }: LayoutProps<"/[domain]/moderation">) => {
  await assertTenantModerator((await params).domain);

  return (
    <UIProvider value="Default">
      <DefaultThemeForcer />
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-48 shrink-0">
            <ModerationSideMenu />
          </aside>
          <main className="min-w-0 flex-1">
            <ClientAnimate>{children}</ClientAnimate>
          </main>
        </div>
      </div>
    </UIProvider>
  );
};

export default ModerationLayout;
