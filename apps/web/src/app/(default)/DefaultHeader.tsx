import { Badge } from "@roadmaps-faciles/ui";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { config } from "@/config";
import { isSelfHost } from "@/lib/deployment";
import { auth } from "@/lib/next-auth/auth";
import { RootHeader } from "@/ui/RootHeader";
import { getUserMenuContext } from "@/utils/userMenuContext";

import { ShadcnNavigation } from "./ShadcnNavigation";
import { ShadcnUserHeaderItem } from "./ShadcnUserHeaderItem";

export const DefaultHeader = async () => {
  const [t, session, selfHost] = await Promise.all([getTranslations("navigation"), auth(), isSelfHost()]);

  const userMenu = session ? await getUserMenuContext({ session }) : undefined;

  return (
    <RootHeader
      brandName={
        <>
          <Image src="/img/roadmaps-faciles.png" alt="" width={24} height={24} className="size-6" />
          <span>{config.brand.name}</span>
          <Badge variant="outline" className="ml-1 text-xs">
            Alpha
          </Badge>
          {config.maintenance && (
            <Badge variant="destructive" className="ml-1 text-xs">
              Maintenance
            </Badge>
          )}
        </>
      }
      homeLinkProps={{
        href: "/",
        title: `${t("home")} - ${config.brand.name}`,
      }}
      navigation={config.maintenance || selfHost ? undefined : <ShadcnNavigation />}
      quickAccessItems={<ShadcnUserHeaderItem userMenu={userMenu} />}
      mobileUserMenu={<ShadcnUserHeaderItem userMenu={userMenu} mode="sheet" />}
    />
  );
};
