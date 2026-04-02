import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import Image from "next/image";
import { type ReactNode } from "react";

import { docsSource } from "@/lib/source";

import "./docs.css";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <RootProvider>
      <DocsLayout
        tree={docsSource.pageTree}
        nav={{
          title: (
            <>
              <Image src="/img/roadmaps-faciles.png" alt="" width={24} height={24} className="shrink-0" />
              <span className="font-semibold">Roadmaps Faciles</span>
            </>
          ),
          url: "/",
        }}
        sidebar={{ collapsible: true }}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
};

export default Layout;
