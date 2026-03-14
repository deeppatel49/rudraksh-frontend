import { createBackendApiUrl, createBackendAssetUrl } from "../backend-api";

const DEFAULT_HOME_STATS = [
  { value: "25,000+", label: "Families Supported" },
  { value: "2,500+", label: "Products in Stock" },
  { value: "4.9/5", label: "Customer Rating" },
];

const DEFAULT_TRUST_PILLARS = [
  {
    title: "Doctor-Ready Prescriptions",
    description: "Upload prescriptions and get guided support with verified dispensing workflows.",
  },
  {
    title: "Fast Neighborhood Delivery",
    description: "Priority dispatch lanes designed for urgent daily-care and chronic-care medicine needs.",
  },
  {
    title: "Assured Genuine Inventory",
    description: "Stock sourced through verified partners with pharmacist-led quality checks.",
  },
];

const DEFAULT_HERO = {
  kicker: "Trusted Pharmacy Care",
  title: "Smart Medicine Planning for Healthier Families",
  description:
    "Get genuine medicines, expert pharmacist guidance, and same-day delivery support for your family's daily and urgent health needs.",
  mediaUrl: "",
  mediaType: "video",
  mediaMimeType: "video/mp4",
  primaryCtaLabel: "Shop Medicines",
  primaryCtaHref: "/products",
  secondaryCtaLabel: "Talk to Pharmacist",
  secondaryCtaHref: "/contact",
};

const DEFAULT_PROMO_BANNER = {
  kicker: "Trusted Rudraksh Pharmacy",
  offerHighlight: "Upto 20%",
  title: "Off Medicine Orders",
  description:
    "Order authentic medicines and wellness essentials from Rudraksh Pharmacy with fast dispatch and secure checkout.",
  mediaUrl: "",
  mediaType: "image",
  mediaMimeType: "image/webp",
  primaryCtaLabel: "Shop Now",
  primaryCtaHref: "/products",
  secondaryCtaLabel: "Contact Team",
  secondaryCtaHref: "/contact",
  metaTitle: "Free Delivery",
  metaSubtitle: "On Select Orders",
};

function getFallbackPayload() {
  return {
    hero: DEFAULT_HERO,
    heroStats: DEFAULT_HOME_STATS,
    trustPillars: DEFAULT_TRUST_PILLARS,
    promoBanner: DEFAULT_PROMO_BANNER,
    source: "fallback",
  };
}

export async function getHomePageContent() {
  try {
    const response = await fetch(createBackendApiUrl("/content/home"), {
      cache: "no-store",
    });

    if (!response.ok) {
      return getFallbackPayload();
    }

    const payload = await response.json();
    const hero = payload?.sections?.hero || {};
    const promoBanner = payload?.sections?.promoBanner || {};

    return {
      hero: {
        kicker: String(hero.kicker || DEFAULT_HERO.kicker),
        title: String(hero.title || DEFAULT_HERO.title),
        description: String(hero.description || DEFAULT_HERO.description),
        mediaUrl: createBackendAssetUrl(String(hero.mediaUrl || DEFAULT_HERO.mediaUrl)),
        mediaType: String(hero.mediaType || DEFAULT_HERO.mediaType).toLowerCase(),
        mediaMimeType: String(hero.mediaMimeType || DEFAULT_HERO.mediaMimeType),
        primaryCtaLabel: String(hero.primaryCtaLabel || DEFAULT_HERO.primaryCtaLabel),
        primaryCtaHref: String(hero.primaryCtaHref || DEFAULT_HERO.primaryCtaHref),
        secondaryCtaLabel: String(hero.secondaryCtaLabel || DEFAULT_HERO.secondaryCtaLabel),
        secondaryCtaHref: String(hero.secondaryCtaHref || DEFAULT_HERO.secondaryCtaHref),
      },
      heroStats:
        Array.isArray(payload?.sections?.heroStats) && payload.sections.heroStats.length
          ? payload.sections.heroStats
          : DEFAULT_HOME_STATS,
      trustPillars:
        Array.isArray(payload?.sections?.trustPillars) && payload.sections.trustPillars.length
          ? payload.sections.trustPillars
          : DEFAULT_TRUST_PILLARS,
      promoBanner:
        payload?.sections?.promoBanner && typeof payload.sections.promoBanner === "object"
          ? {
              kicker: String(promoBanner.kicker || DEFAULT_PROMO_BANNER.kicker),
              offerHighlight: String(promoBanner.offerHighlight || DEFAULT_PROMO_BANNER.offerHighlight),
              title: String(promoBanner.title || DEFAULT_PROMO_BANNER.title),
              description: String(promoBanner.description || DEFAULT_PROMO_BANNER.description),
              mediaUrl: createBackendAssetUrl(String(promoBanner.mediaUrl || DEFAULT_PROMO_BANNER.mediaUrl)),
              mediaType: String(promoBanner.mediaType || DEFAULT_PROMO_BANNER.mediaType).toLowerCase(),
              mediaMimeType: String(promoBanner.mediaMimeType || DEFAULT_PROMO_BANNER.mediaMimeType),
              primaryCtaLabel: String(promoBanner.primaryCtaLabel || DEFAULT_PROMO_BANNER.primaryCtaLabel),
              primaryCtaHref: String(promoBanner.primaryCtaHref || DEFAULT_PROMO_BANNER.primaryCtaHref),
              secondaryCtaLabel: String(promoBanner.secondaryCtaLabel || DEFAULT_PROMO_BANNER.secondaryCtaLabel),
              secondaryCtaHref: String(promoBanner.secondaryCtaHref || DEFAULT_PROMO_BANNER.secondaryCtaHref),
              metaTitle: String(promoBanner.metaTitle || DEFAULT_PROMO_BANNER.metaTitle),
              metaSubtitle: String(promoBanner.metaSubtitle || DEFAULT_PROMO_BANNER.metaSubtitle),
            }
          : DEFAULT_PROMO_BANNER,
      source: "backend",
    };
  } catch {
    return getFallbackPayload();
  }
}
