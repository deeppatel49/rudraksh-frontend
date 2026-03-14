import { redirect } from "next/navigation";

export async function generateMetadata() {
  return {
    title: "Store Locator",
    description: "Find your nearest Rudraksh Pharmacy store.",
  };
}

export function generateStaticParams() {
  return [];
}

export default async function BlogDetailPage() {
  redirect("/store-locator");
}

