import { notFound } from "next/navigation";
import { products } from "../../../data/products";
import { ProductReviewsView } from "../../../components/product-reviews-view";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = products.find((item) => item.id === resolvedParams.id);

  if (!product) {
    return {
      title: "Review Not Found",
    };
  }

  return {
    title: `${product.name} Review`,
    description: `Read customer rating and review for ${product.name}.`,
  };
}

export default async function ProductReviewsPage({ params }) {
  const resolvedParams = await params;
  const product = products.find((item) => item.id === resolvedParams.id);

  if (!product) {
    notFound();
  }

  return <ProductReviewsView productId={product.id} productName={product.name} />;
}
