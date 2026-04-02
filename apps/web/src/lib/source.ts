import { loader } from "fumadocs-core/source";
import { docs } from "fumadocs-mdx:collections/server";

export const docsSource = loader({
  baseUrl: "/doc",
  source: docs.toFumadocsSource(),
});
