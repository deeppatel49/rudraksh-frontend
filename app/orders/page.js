import { CustomerOrdersView } from "../components/customer-profile-view";

export const metadata = {
  title: "My Orders | Rudraksh Pharmacy",
  description: "View recent and previous order information for your Rudraksh Pharmacy account.",
};

export default function OrdersPage() {
  return <CustomerOrdersView />;
}
