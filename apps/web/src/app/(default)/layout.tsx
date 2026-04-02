import { ClientAnimate } from "@/components/utils/ClientAnimate";
import { config } from "@/config";

import styles from "../root.module.scss";
import { DefaultFooter } from "./DefaultFooter";
import { DefaultHeader } from "./DefaultHeader";
import { RootSystemMessageDisplay } from "./RootSystemMessageDisplay";

const DefaultLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <>
      <DefaultHeader />
      <ClientAnimate as="main" id="content" className={styles.content}>
        {config.maintenance ? <RootSystemMessageDisplay code="maintenance" noRedirect /> : children}
      </ClientAnimate>
      <DefaultFooter id="footer" />
    </>
  );
};

export default DefaultLayout;
