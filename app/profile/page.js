import { CustomerProfileView } from "../components/customer-profile-view";

export const metadata = {
  title: "My Profile | Account Settings | Rudraksh Pharmacy",
  description: "Manage your Rudraksh Pharmacy profile. View order history, update personal information, save prescriptions, and track deliveries.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/profile",
  },
};

export default function ProfilePage() {
  return <CustomerProfileView />;
}
