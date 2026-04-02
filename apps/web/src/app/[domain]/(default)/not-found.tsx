import { RootSystemMessageDisplay } from "../../(default)/RootSystemMessageDisplay";
import { DsfrSystemMessageDisplay } from "../../DsfrSystemMessageDisplay";
import { getTenantTheme } from "./getTenantTheme";

const TenantNotFound = async () => {
  const theme = await getTenantTheme();

  if (theme === "Dsfr") {
    return <DsfrSystemMessageDisplay code="not-found" />;
  }

  return <RootSystemMessageDisplay code="not-found" />;
};

export default TenantNotFound;
