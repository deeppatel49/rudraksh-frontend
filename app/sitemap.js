export default function sitemap() {
  const baseUrl = "https://rudrakshpharmacy.com";
  
  const routes = [
    { path: "", priority: 1.0, changeFreq: "daily" },
    { path: "/about", priority: 0.9, changeFreq: "monthly" },
    { path: "/products", priority: 0.9, changeFreq: "daily" },
    { path: "/medicine", priority: 0.9, changeFreq: "daily" },
    { path: "/contact", priority: 0.8, changeFreq: "monthly" },
    { path: "/store-locator", priority: 0.8, changeFreq: "monthly" },
    { path: "/reviews", priority: 0.7, changeFreq: "weekly" },
    { path: "/quick-order", priority: 0.7, changeFreq: "monthly" },
    { path: "/privacy", priority: 0.5, changeFreq: "yearly" },
    { path: "/terms", priority: 0.5, changeFreq: "yearly" },
    { path: "/login", priority: 0.4, changeFreq: "monthly" },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));
}
