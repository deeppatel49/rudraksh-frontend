import StoreLocatorView from '../components/store-locator-view';

export const metadata = {
  title: "Find Nearest Pharmacy | Store Locator | Rudraksh Pharmacy",
  description: "Locate the nearest Rudraksh Pharmacy store in Surat, Gujarat. Get directions, store hours, contact details, and visit us for immediate medicine needs.",
  keywords: [
    "pharmacy near me",
    "Rudraksh Pharmacy location",
    "pharmacy store Surat",
    "medicine shop near me",
    "pharmacy store locator",
  ],
  openGraph: {
    title: "Find Nearest Rudraksh Pharmacy Store",
    description: "Locate our pharmacy stores in Surat with directions and contact details.",
    type: "website",
    url: "https://rudrakshpharmacy.com/store-locator",
  },
  alternates: {
    canonical: "/store-locator",
  },
};

export default function StoreLocatorPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <StoreLocatorView />
    </main>
  );
}
