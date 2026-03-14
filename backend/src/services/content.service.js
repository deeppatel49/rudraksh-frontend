import {
  getAboutContentRecord,
  getHomeContentRecord,
  getLegacyPageContentBySlug,
  upsertAboutContentRecord,
  upsertHomeContentRecord,
} from "../repositories/content.repository.js";

const HOME_DEFAULT = {
  hero: {
    kicker: "Trusted Pharmacy Care",
    title: "Smart Medicine Planning for Healthier Families",
    description: "Get genuine medicines, expert pharmacist guidance, and same-day delivery support for your family's daily and urgent health needs.",
    mediaUrl: "",
    mediaType: "video",
    mediaMimeType: "video/mp4",
    primaryCtaLabel: "Shop Medicines",
    primaryCtaHref: "/products",
    secondaryCtaLabel: "Talk to Pharmacist",
    secondaryCtaHref: "/contact",
  },
  heroStats: [
    { value: "25,000+", label: "Families Supported" },
    { value: "2,500+", label: "Products in Stock" },
    { value: "4.9/5", label: "Customer Rating" },
  ],
  trustPillars: [
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
  ],
  promoBanner: {
    kicker: "Trusted Rudraksh Pharmacy",
    offerHighlight: "Upto 20%",
    title: "Off Medicine Orders",
    description: "Order authentic medicines and wellness essentials from Rudraksh Pharmacy with fast dispatch and secure checkout.",
    mediaUrl: "",
    mediaType: "image",
    mediaMimeType: "image/webp",
    primaryCtaLabel: "Shop Now",
    primaryCtaHref: "/products",
    secondaryCtaLabel: "Contact Team",
    secondaryCtaHref: "/contact",
    metaTitle: "Free Delivery",
    metaSubtitle: "On Select Orders",
  },
};

const ABOUT_DEFAULT = {
  trustStats: [
    { label: "Happy Customers", value: "25,000+" },
    { label: "Products Available", value: "2,500+" },
    { label: "Licensed Pharmacists", value: "6" },
    { label: "Daily Orders", value: "900+" },
  ],
  highlights: [
    "Every medicine is sourced from licensed and verified supply partners",
    "Prescription and OTC guidance is handled by trained pharmacy staff",
    "Cold-chain and sensitive items are handled with strict quality checks",
  ],
  storyImage: {
    mediaUrl: "/rudraksha-logo-v2.png",
    mediaType: "image",
    mediaMimeType: "image/png",
    alt: "Rudraksh Pharmacy trusted medicine care",
  },
};

let ensureDefaultsPromise = null;

async function ensureDefaultPagesExist() {
  const [homeContent, aboutContent] = await Promise.all([
    getHomeContentRecord(),
    getAboutContentRecord(),
  ]);

  const pendingUpserts = [];
  const [legacyHomeContent, legacyAboutContent] = await Promise.all([
    homeContent ? null : getLegacyPageContentBySlug("home"),
    aboutContent ? null : getLegacyPageContentBySlug("about"),
  ]);

  if (!homeContent) {
    pendingUpserts.push(
      upsertHomeContentRecord({
        title: "Home",
        description: "Rudraksh Pharmacy homepage content",
        sections: {
          hero: legacyHomeContent?.sections?.hero || HOME_DEFAULT.hero,
          heroStats: Array.isArray(legacyHomeContent?.sections?.heroStats)
            ? legacyHomeContent.sections.heroStats
            : HOME_DEFAULT.heroStats,
          trustPillars: Array.isArray(legacyHomeContent?.sections?.trustPillars)
            ? legacyHomeContent.sections.trustPillars
            : HOME_DEFAULT.trustPillars,
        },
        seo_meta: legacyHomeContent?.seo_meta || {
          title: "Home | Rudraksh Pharmacy",
          description: "Shop medicines and wellness essentials online.",
        },
      })
    );
  }

  if (!aboutContent) {
    pendingUpserts.push(
      upsertAboutContentRecord({
        title: "About",
        description: "Rudraksh Pharmacy about page content",
        sections: {
          trustStats: Array.isArray(legacyAboutContent?.sections?.trustStats)
            ? legacyAboutContent.sections.trustStats
            : ABOUT_DEFAULT.trustStats,
          highlights: Array.isArray(legacyAboutContent?.sections?.highlights)
            ? legacyAboutContent.sections.highlights
            : ABOUT_DEFAULT.highlights,
          storyImage: legacyAboutContent?.sections?.storyImage || ABOUT_DEFAULT.storyImage,
        },
        seo_meta: legacyAboutContent?.seo_meta || {
          title: "About | Rudraksh Pharmacy",
          description: "Learn about Rudraksh Pharmacy mission and values.",
        },
      })
    );
  }

  if (pendingUpserts.length) {
    await Promise.all(pendingUpserts);
  }
}

export async function ensureContentDefaultsSeeded() {
  if (!ensureDefaultsPromise) {
    ensureDefaultsPromise = ensureDefaultPagesExist().catch((error) => {
      ensureDefaultsPromise = null;
      throw error;
    });
  }

  await ensureDefaultsPromise;
}

function normalizeAboutTrustStats(trustStats) {
  const baseStats = Array.isArray(trustStats) && trustStats.length
    ? trustStats
    : ABOUT_DEFAULT.trustStats;

  return baseStats.map((item) => {
    if (item?.label === "Licensed Pharmacists") {
      return { ...item, value: "6" };
    }

    return item;
  });
}

export async function fetchHomeContent() {
  await ensureContentDefaultsSeeded();
  const content = await getHomeContentRecord();
  const sections = content?.sections || {};
  const hero = sections.hero && typeof sections.hero === "object"
    ? sections.hero
    : {};

  const normalizedHero = {
    kicker: String(hero.kicker || HOME_DEFAULT.hero.kicker).trim(),
    title: String(hero.title || HOME_DEFAULT.hero.title).trim(),
    description: String(hero.description || HOME_DEFAULT.hero.description).trim(),
    mediaUrl: String(hero.mediaUrl || HOME_DEFAULT.hero.mediaUrl).trim(),
    mediaType: String(hero.mediaType || HOME_DEFAULT.hero.mediaType).trim(),
    mediaMimeType: String(hero.mediaMimeType || HOME_DEFAULT.hero.mediaMimeType).trim(),
    primaryCtaLabel: String(hero.primaryCtaLabel || HOME_DEFAULT.hero.primaryCtaLabel).trim(),
    primaryCtaHref: String(hero.primaryCtaHref || HOME_DEFAULT.hero.primaryCtaHref).trim(),
    secondaryCtaLabel: String(hero.secondaryCtaLabel || HOME_DEFAULT.hero.secondaryCtaLabel).trim(),
    secondaryCtaHref: String(hero.secondaryCtaHref || HOME_DEFAULT.hero.secondaryCtaHref).trim(),
  };

  return {
    sections: {
      hero: normalizedHero,
      heroStats: Array.isArray(sections.heroStats) ? sections.heroStats : HOME_DEFAULT.heroStats,
      trustPillars: Array.isArray(sections.trustPillars) ? sections.trustPillars : HOME_DEFAULT.trustPillars,
      promoBanner: sections.promoBanner && typeof sections.promoBanner === "object"
        ? {
            kicker: String(sections.promoBanner.kicker || HOME_DEFAULT.promoBanner.kicker).trim(),
            offerHighlight: String(sections.promoBanner.offerHighlight || HOME_DEFAULT.promoBanner.offerHighlight).trim(),
            title: String(sections.promoBanner.title || HOME_DEFAULT.promoBanner.title).trim(),
            description: String(sections.promoBanner.description || HOME_DEFAULT.promoBanner.description).trim(),
            mediaUrl: String(sections.promoBanner.mediaUrl || HOME_DEFAULT.promoBanner.mediaUrl).trim(),
            mediaType: String(sections.promoBanner.mediaType || HOME_DEFAULT.promoBanner.mediaType).trim(),
            mediaMimeType: String(sections.promoBanner.mediaMimeType || HOME_DEFAULT.promoBanner.mediaMimeType).trim(),
            primaryCtaLabel: String(sections.promoBanner.primaryCtaLabel || HOME_DEFAULT.promoBanner.primaryCtaLabel).trim(),
            primaryCtaHref: String(sections.promoBanner.primaryCtaHref || HOME_DEFAULT.promoBanner.primaryCtaHref).trim(),
            secondaryCtaLabel: String(sections.promoBanner.secondaryCtaLabel || HOME_DEFAULT.promoBanner.secondaryCtaLabel).trim(),
            secondaryCtaHref: String(sections.promoBanner.secondaryCtaHref || HOME_DEFAULT.promoBanner.secondaryCtaHref).trim(),
            metaTitle: String(sections.promoBanner.metaTitle || HOME_DEFAULT.promoBanner.metaTitle).trim(),
            metaSubtitle: String(sections.promoBanner.metaSubtitle || HOME_DEFAULT.promoBanner.metaSubtitle).trim(),
          }
        : HOME_DEFAULT.promoBanner,
    },
    seo: content?.seo_meta || {},
  };
}

export async function fetchAboutContent() {
  await ensureContentDefaultsSeeded();
  const content = await getAboutContentRecord();
  const sections = content?.sections || {};
  return {
    sections: {
      trustStats: normalizeAboutTrustStats(sections.trustStats),
      highlights: Array.isArray(sections.highlights) ? sections.highlights : ABOUT_DEFAULT.highlights,
      storyImage: sections.storyImage && typeof sections.storyImage === "object"
        ? {
            mediaUrl: String(sections.storyImage.mediaUrl || ABOUT_DEFAULT.storyImage.mediaUrl).trim(),
            mediaType: String(sections.storyImage.mediaType || ABOUT_DEFAULT.storyImage.mediaType).trim(),
            mediaMimeType: String(sections.storyImage.mediaMimeType || ABOUT_DEFAULT.storyImage.mediaMimeType).trim(),
            alt: String(sections.storyImage.alt || ABOUT_DEFAULT.storyImage.alt).trim(),
          }
        : ABOUT_DEFAULT.storyImage,
    },
    seo: content?.seo_meta || {},
  };
}

export async function fetchSeoMeta(pageSlug) {
  await ensureContentDefaultsSeeded();
  if (pageSlug === "home") {
    const content = await getHomeContentRecord();
    return content?.seo_meta || null;
  }

  if (pageSlug === "about") {
    const content = await getAboutContentRecord();
    return content?.seo_meta || null;
  }

  return null;
}

export async function saveHomeContent(payload) {
  const content = await upsertHomeContentRecord({
    title: "Home",
    description: "Rudraksh Pharmacy homepage content",
    sections: {
      hero: {
        kicker: payload.hero.kicker,
        title: payload.hero.title,
        description: payload.hero.description,
        mediaUrl: payload.hero.mediaUrl,
        mediaType: payload.hero.mediaType,
        mediaMimeType: payload.hero.mediaMimeType,
        primaryCtaLabel: payload.hero.primaryCtaLabel,
        primaryCtaHref: payload.hero.primaryCtaHref,
        secondaryCtaLabel: payload.hero.secondaryCtaLabel,
        secondaryCtaHref: payload.hero.secondaryCtaHref,
      },
      heroStats: payload.heroStats,
      trustPillars: payload.trustPillars,
      promoBanner: payload.promoBanner,
    },
    seo_meta: payload.seo,
  });

  return {
    sections: content?.sections || {},
    seo: content?.seo_meta || {},
  };
}

export async function saveAboutContent(payload) {
  const content = await upsertAboutContentRecord({
    title: "About",
    description: "Rudraksh Pharmacy about page content",
    sections: {
      trustStats: payload.trustStats,
      highlights: payload.highlights,
      storyImage: payload.storyImage,
    },
    seo_meta: payload.seo,
  });

  return {
    sections: content?.sections || {},
    seo: content?.seo_meta || {},
  };
}
