import { CartView } from "../components/cart-view";

export const metadata = {
  title: "Shopping Cart | Rudraksh Pharmacy",
  description: "Review your selected medicines and healthcare products. Verify quantities, apply coupons, and proceed to secure checkout at Rudraksh Pharmacy.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/cart",
  },
};

export default function CartPage() {
  return <CartView />;
}
