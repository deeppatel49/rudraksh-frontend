import { HomeReviewsSection } from "../components/home-reviews-section";

export const metadata = {
  title: "Customer Reviews & Testimonials | Rudraksh Pharmacy",
  description: "Read genuine customer reviews and testimonials about Rudraksh Pharmacy. Share your experience and discover why 25,000+ families trust us for healthcare needs.",
  keywords: [
    "pharmacy reviews",
    "customer testimonials",
    "Rudraksh Pharmacy feedback",
    "medicine store reviews Surat",
    "customer ratings",
  ],
  openGraph: {
    title: "Customer Reviews - Rudraksh Pharmacy",
    description: "See what 25,000+ customers say about Rudraksh Pharmacy.",
    type: "website",
    url: "https://rudrakshpharmacy.com/reviews",
  },
  alternates: {
    canonical: "/reviews",
  },
};

export default function ReviewsPage() {
  return <HomeReviewsSection />;
}
