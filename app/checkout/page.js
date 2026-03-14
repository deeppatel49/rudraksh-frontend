import { CheckoutView } from "../components/checkout-view";

export const metadata = {
  title: "Secure Checkout | Rudraksh Pharmacy",
  description: "Complete your order securely at Rudraksh Pharmacy. Multiple payment options, prescription upload, and fast delivery to your doorstep.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/checkout",
  },
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
