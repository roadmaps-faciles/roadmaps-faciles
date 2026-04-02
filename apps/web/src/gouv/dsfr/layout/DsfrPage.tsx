import { type PropsWithChildren } from "react";

import { StartDsfrOnHydration } from "@/gouv/dsfr-bootstrap";

export const DsfrPage = ({ children }: PropsWithChildren) => (
  <>
    <StartDsfrOnHydration />
    {children}
  </>
);
