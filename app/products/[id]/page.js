import { ProductDetailView } from "../../components/product-detail-view";
import { createBackendApiUrl } from "../../lib/backend-api";

async function getProduct(productId) {
  try {
    const res = await fetch(createBackendApiUrl(`/products/${productId}`), {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return payload?.product || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  const name = product?.name || product?.itemName || "Product";
  const company = product?.manufacturer || product?.company || "";
  return {
    title: `${name}${company ? ` by ${company}` : ""} | Rudraksh Pharmacy`,
    description: product?.generic
      ? `${name} — Generic: ${product.generic}. Available at Rudraksh Pharmacy.`
      : `Buy ${name} at Rudraksh Pharmacy. Genuine medicines with fast delivery.`,
  };
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;
  const product = await getProduct(productId);

  return <ProductDetailView product={product} productId={productId} />;
}
