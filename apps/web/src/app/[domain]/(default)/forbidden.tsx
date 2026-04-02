import { RootSystemMessageDisplay } from "../../(default)/RootSystemMessageDisplay";
import { DsfrSystemMessageDisplay } from "../../DsfrSystemMessageDisplay";
import { getTenantTheme } from "./getTenantTheme";

const TenantForbidden = async () => {
  const theme = await getTenantTheme();

  if (theme === "Dsfr") {
    return <DsfrSystemMessageDisplay code="forbidden" />;
  }

  return <RootSystemMessageDisplay code="forbidden" />;
};

export default TenantForbidden;
