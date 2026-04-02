import { type MetadataRoute } from "next";

import { config } from "@/config";

const robots = (): MetadataRoute.Robots => {
  const isProduction = config.env === "prod";

  if (!isProduction) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/login", "/2fa"],
    },
    sitemap: `${config.host}/sitemap.xml`,
  };
};

export default robots;
