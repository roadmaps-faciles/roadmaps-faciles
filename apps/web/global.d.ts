// add custom Next tags
interface NextFetchRequestConfig {
  tags?: Array<"test" | "yo" | ({ _?: never } & string)>;
}

declare module "@codegouvfr/react-dsfr/dsfr/*.svg" {
  import { type StaticImageData } from "next/image";

  const value: StaticImageData | string;
  // eslint-disable-next-line import/no-default-export
  export default value;
}

declare module "@/gouv/dsfr/*.svg" {
  import { type StaticImageData } from "next/image";

  const value: StaticImageData;
  // eslint-disable-next-line import/no-default-export
  export default value;
}
