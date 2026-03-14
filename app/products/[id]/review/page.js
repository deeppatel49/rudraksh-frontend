import { notFound, redirect } from "next/navigation";
import { products } from "../../../data/products";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = products.find((item) => item.id === resolvedParams.id);

  if (!product) {
    return {
      title: "Review Form Not Found",
    };
  }

  return {
    title: `${product.name} Review Form`,
    description: `Create a review for ${product.name}.`,
  };
}

export default async function CreateProductReviewPage({ params }) {
  const resolvedParams = await params;
  const product = products.find((item) => item.id === resolvedParams.id);

  if (!product) {
    notFound();
  }

  redirect(`/products/${product.id}/reviews`);
}
