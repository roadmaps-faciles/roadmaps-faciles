import { Footer, type FooterProps } from "./Footer";

type RootFooterProps = {
  brandName: string;
} & Omit<FooterProps, "bottomLinks" | "serviceName" | "variant">;

export const RootFooter = (props: RootFooterProps) => <Footer {...props} variant="root" />;
