import { QuickOrderView } from "../components/quick-order-view";

export const metadata = {
  title: "Quick Order with Prescription | Rudraksh Pharmacy",
  description: "Upload your prescription and place orders quickly at Rudraksh Pharmacy. Fast processing, verified by licensed pharmacists, secure prescription handling.",
  keywords: [
    "prescription upload",
    "quick medicine order",
    "prescription order online",
    "fast pharmacy order",
    "Rudraksh quick order",
  ],
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/quick-order",
  },
};

export default function QuickOrderPage() {
  return <QuickOrderView />;
}

