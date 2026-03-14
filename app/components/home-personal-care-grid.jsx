import Image from "next/image";
import Link from "next/link";

const PERSONAL_CARE_CATEGORIES = [
  { title: "Injection", image: "/products/antiseptic-solution.svg" },
  { title: "Ayurvedic Medicine", image: "/brands/wellbeing.svg" },
  { title: "Face Wash", image: "/brands/himalaya.svg" },
  { title: "Baby Care", image: "/brands/prohance.svg" },
  { title: "Generic Medicine", image: "/products/default-medicine.svg" },
  { title: "Skin Care", image: "/brands/vaseline.svg" },
];

export function HomePersonalCareGrid() {

  return (
    <section className="home-personal-care-grid-section">
      <div className="container">
        <div className="home-personal-care-cards-head">
          <h2>Personal care</h2>
          <Link href="/products" className="home-see-all-btn" aria-label="See all personal care products">
            See all
            <span aria-hidden="true">&gt;</span>
          </Link>
        </div>

        <div className="home-personal-care-grid">
          {PERSONAL_CARE_CATEGORIES.map((item) => (
            <article
              key={item.title}
              className="home-personal-care-card"
              aria-label={item.title}
            >
              <h3>{item.title}</h3>
              <div className="home-personal-care-image-wrap">
                <Image src={item.image} alt={item.title} width={108} height={78} className="home-personal-care-image" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


