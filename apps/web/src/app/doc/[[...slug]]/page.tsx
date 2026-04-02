import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { TrackPageView } from "@/lib/ee/tracking-provider";
import { docsPageViewed } from "@/lib/ee/tracking-provider/trackingPlan";
import { docsSource } from "@/lib/source";

import { getDocMDXComponents } from "../mdx-components";

const Page = async (props: { params: Promise<{ slug?: string[] }> }) => {
  const params = await props.params;
  const page = docsSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const path = `/${(params.slug ?? []).join("/")}`;
  const section = params.slug?.[0] ?? "root";

  return (
    <DocsPage toc={page.data.toc ?? []} tableOfContent={{ style: "clerk" }} tableOfContentPopover={{ style: "clerk" }}>
      <TrackPageView event={docsPageViewed({ path, section })} />
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getDocMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
};

export default Page;

export const generateStaticParams = () => {
  return docsSource.generateParams();
};

export const generateMetadata = async (props: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> => {
  const params = await props.params;
  const page = docsSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
};
