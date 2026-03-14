export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/cart", "/checkout", "/profile", "/login", "/forgot-password"],
      },
    ],
    sitemap: "https://rudrakshpharmacy.com/sitemap.xml",
  };
}
