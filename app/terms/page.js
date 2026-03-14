export const metadata = {
  title: "Terms & Conditions | Rudraksh Pharmacy",
  description: "Read the terms and conditions for using Rudraksh Pharmacy services. Understand purchase policies, refund conditions, and usage guidelines for our online pharmacy.",
  keywords: [
    "terms and conditions",
    "pharmacy terms",
    "Rudraksh Pharmacy policies",
    "refund policy",
    "usage terms",
  ],
  openGraph: {
    title: "Terms & Conditions - Rudraksh Pharmacy",
    description: "Terms of service for using Rudraksh Pharmacy.",
    type: "website",
    url: "https://rudrakshpharmacy.com/terms",
  },
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <section className="section section-soft">
      <div className="container">
        <div className="section-head">
          <h1>Conditions of Use</h1>
          <p>
            By accessing and using Rudraksh Pharmacy, you agree to these terms and our
            operating policies.
          </p>
        </div>

        <article className="content-card">
          <h2>Use of Service</h2>
          <p>
            You agree to provide accurate information during account creation, profile
            completion, and order placement. Misuse of the platform or fraudulent activity
            may lead to account restriction.
          </p>

          <h2>Orders and Availability</h2>
          <p>
            Product availability, pricing, and dispatch timelines are subject to change.
            Orders are confirmed after verification and may be modified or canceled if
            products are unavailable.
          </p>

          <h2>Medical Disclaimer</h2>
          <p>
            Information on this website is for general awareness only and does not replace
            professional medical advice. Always consult a qualified healthcare professional
            for diagnosis and treatment decisions.
          </p>
        </article>
      </div>
    </section>
  );
}
