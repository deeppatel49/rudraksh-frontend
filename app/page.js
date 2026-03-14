import Link from "next/link";
import { HomeSearchStrip } from "./components/home-search-strip";
import { HomeFeaturedBrands } from "./components/home-featured-brands";
import { HomeReviewsMarquee } from "./components/home-reviews-marquee";
import { getHomePageContent } from "./lib/services/home-service";

const heroVideoSrc = new URL("./img/Creative_logo_dynamic_layout_delpmaspu_.mp4", import.meta.url).toString();

export const metadata = {
  title: "Home",
  description:
    "Shop medicines and wellness essentials from Rudraksh Pharmacy with fast delivery and trusted pharmacist guidance.",
};

export default async function HomePage() {
  const { hero, heroStats, trustPillars, promoBanner } = await getHomePageContent();

  return (
    <>
      <HomeSearchStrip />

      <section className="section container home-hero-section">
        <div className="home-hero-shell" aria-label="Pharmacy hero">
          <div className="home-hero-video-bg" aria-hidden="true">
            {hero.mediaUrl && hero.mediaType === "image" ? (
              <img className="home-hero-video" src={hero.mediaUrl} alt="" />
            ) : (
              <video
                key={hero.mediaUrl || heroVideoSrc}
                className="home-hero-video"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/rudraksha-logo-v2.png"
              >
                <source
                  src={hero.mediaUrl || heroVideoSrc}
                  type={hero.mediaMimeType || "video/mp4"}
                />
              </video>
            )}
          </div>
          <div className="home-hero-overlay" />

          <div className="home-hero-content">
            <p className="home-hero-kicker-new">{hero.kicker}</p>
            <h1>{hero.title}</h1>
            <p>{hero.description}</p>
            <div className="home-hero-actions-new">
              <Link href={hero.primaryCtaHref} className="primary-btn">
                {hero.primaryCtaLabel}
              </Link>
              <Link href={hero.secondaryCtaHref} className="secondary-btn">
                {hero.secondaryCtaLabel}
              </Link>
            </div>
            <div className="home-hero-stats">
              {heroStats.map((item) => (
                <article key={item.label} className="home-hero-stat-card">
                  <h3>{item.value}</h3>
                  <p>{item.label}</p>
                </article>
              ))}
            </div>
          </div>

        </div>
      </section>

      <section className="promo-hero section">
        <div className="container">
          <div className="promo-banner">
            <div className="promo-visual">
              {promoBanner.mediaUrl ? (
                promoBanner.mediaType === "video" ? (
                  <video
                    key={promoBanner.mediaUrl}
                    className="home-hero-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls={false}
                  >
                    <source
                      src={promoBanner.mediaUrl}
                      type={promoBanner.mediaMimeType || "video/mp4"}
                    />
                  </video>
                ) : (
                  <img className="home-hero-video" src={promoBanner.mediaUrl} alt={promoBanner.title} />
                )
              ) : (
                <div className="pill-grid">
                  <span className="pill-item">Vitamin Care</span>
                  <span className="pill-item">Daily Wellness</span>
                  <span className="pill-item">Medical Devices</span>
                  <span className="pill-item">First Aid</span>
                </div>
              )}
            </div>
            <div className="promo-copy">
              <p className="promo-kicker">{promoBanner.kicker}</p>
              <h1>
                <span className="promo-offer-highlight">{promoBanner.offerHighlight}</span> {promoBanner.title}
              </h1>
              <p>{promoBanner.description}</p>
              <div className="hero-actions">
                <Link href={promoBanner.primaryCtaHref} className="primary-btn large">
                  {promoBanner.primaryCtaLabel}
                </Link>
                <Link href={promoBanner.secondaryCtaHref} className="secondary-btn large">
                  {promoBanner.secondaryCtaLabel}
                </Link>
              </div>
              <div className="promo-meta">
                <div>
                  <strong>{promoBanner.metaTitle}</strong>
                  <span>{promoBanner.metaSubtitle}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeFeaturedBrands />

      <section className="section container home-trust-pillar-section">
        <div className="section-head">
          <h2>Designed for Reliable Healthcare Shopping</h2>
          <p>
            A cleaner, faster, and more trustworthy experience inspired by top pharmacy platforms,
            built for daily medicine purchases and repeat family care.
          </p>
        </div>
        <div className="home-trust-pillar-grid">
          {trustPillars.map((pillar) => (
            <article key={pillar.title} className="home-trust-pillar-card">
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      <HomeReviewsMarquee />

    </>
  );
}
