import Image from "next/image";

const FEATURED_BRANDS = [
  { name: "Dettol", logo: "/brands/dettol.svg", focus: "Hygiene Care" },
  { name: "Supradyn", logo: "/brands/supradyn.svg", focus: "Daily Vitamins" },
  { name: "Volini", logo: "/brands/volini.svg", focus: "Pain Relief" },
  { name: "Wellbeing", logo: "/brands/wellbeing.svg", focus: "Nutrition" },
  { name: "Parachute", logo: "/brands/parachute.svg", focus: "Hair Care" },
  { name: "Vaseline", logo: "/brands/vaseline.svg", focus: "Skin Care" },
  { name: "Moov", logo: "/brands/moov.svg", focus: "Muscle Support" },
];

export function HomeFeaturedBrands() {
  return (
    <section className="home-featured-brands-section">
      <div className="container">
        <div className="home-featured-brands-head">
          <h2>Featured brands</h2>
          <p>Trusted healthcare and wellness brands curated for everyday needs.</p>
        </div>

        <div className="home-featured-brands-marquee">
          <div className="home-featured-brands-track">
            {[...FEATURED_BRANDS, ...FEATURED_BRANDS].map((brand, index) => (
              <article
                key={`${brand.name}-${index}`}
                className="home-featured-brand-link"
                aria-hidden={index >= FEATURED_BRANDS.length}
              >
                <div className="home-featured-brand-card">
                  <div className="home-featured-brand-logo">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={130}
                      height={70}
                      className="home-featured-brand-image"
                    />
                  </div>
                  <div className="home-featured-brand-meta">
                    <h3>{brand.name}</h3>
                    <p>{brand.focus}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
