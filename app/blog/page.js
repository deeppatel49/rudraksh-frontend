import { redirect } from "next/navigation";

export const metadata = {
  title: "Store Locator",
  description: "Find your nearest Rudraksh Pharmacy store.",
};

export default function BlogPage() {
  redirect("/store-locator");
}
