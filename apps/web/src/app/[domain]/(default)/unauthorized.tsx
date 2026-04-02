import { RootSystemMessageDisplay } from "../../(default)/RootSystemMessageDisplay";
import { DsfrSystemMessageDisplay } from "../../DsfrSystemMessageDisplay";
import { getTenantTheme } from "./getTenantTheme";

const TenantUnauthorized = async () => {
  const theme = await getTenantTheme();

  if (theme === "Dsfr") {
    return <DsfrSystemMessageDisplay code="unauthorized" />;
  }

  return <RootSystemMessageDisplay code="unauthorized" />;
};

export default TenantUnauthorized;
