export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/services",
        "/about",
        "/gallery",
        "/contact",
        "/privacy",
        "/terms",
      ],
      disallow: [
        "/dashboard",
        "/dashboard/",
        "/account",
        "/account/",
        "/login",
        "/signup",
        "/api/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
