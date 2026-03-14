import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "../../data/products";
import { getCachedMedicines } from "../../data/medicines";
import { ProductDetailActions } from "../../components/product-detail-actions";
import { ProductDetailImage } from "../../components/product-detail-image";

// Combine all products
function getAllProducts() {
  const medicines = getCachedMedicines();
  return [...medicines, ...products];
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const allProducts = getAllProducts();
  const product = allProducts.find((item) => item.id === resolvedParams.id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} - Buy Online | Rudraksh Pharmacy`,
    description: product.description || `Buy ${product.name} online at Rudraksh Pharmacy. Genuine product, verified by licensed pharmacists, fast delivery in Surat.`,
    keywords: [
      product.name,
      `buy ${product.name}`,
      product.category,
      "online pharmacy",
      "genuine medicines",
      "Rudraksh Pharmacy",
    ],
    openGraph: {
      title: `${product.name} | Rudraksh Pharmacy`,
      description: product.description || `Buy ${product.name} online with verified quality and fast delivery.`,
      type: "website",
      url: `https://rudrakshpharmacy.com/products/${product.id}`,
      images: product.image ? [{
        url: product.image,
        width: 800,
        height: 800,
        alt: product.name,
      }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name}`,
      description: product.description || `Buy ${product.name} at Rudraksh Pharmacy`,
    },
    alternates: {
      canonical: `/products/${product.id}`,
    },
  };
}

export function generateStaticParams() {
  const allProducts = getAllProducts();
  return allProducts.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const allProducts = getAllProducts();
  const product = allProducts.find((item) => item.id === resolvedParams.id);

  if (!product) {
    notFound();
  }

  // Product structured data for SEO
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} available at Rudraksh Pharmacy`,
    "brand": {
      "@type": "Brand",
      "name": product.manufacturer || "Rudraksh Pharmacy"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://rudrakshpharmacy.com/products/${product.id}`,
      "priceCurrency": "INR",
      "price": product.discountedPrice || product.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Rudraksh Pharmacy"
      }
    },
    "category": product.category,
  };

  if (product.image) {
    productSchema.image = product.image;
  }

  return (
    <section className="section section-soft">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      
      <div className="container">
        <div className="breadcrumb-nav" style={{ marginBottom: "24px" }}>
          <Link href="/products" style={{ color: "#2563eb", textDecoration: "underline" }}>
            Products
          </Link>
          <span style={{ margin: "0 8px", color: "#64748b" }}>/</span>
          <span style={{ color: "#475569" }}>{product.name}</span>
        </div>

        <article className="product-detail-card">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1.5fr", gap: "32px", marginTop: "32px" }}>
            {/* Left: Image Gallery */}
            <div className="product-gallery-left">
              <ProductDetailImage product={product} />
            </div>

            {/* Center: Large Image & Info */}
            <div className="product-detail-center">
              <div style={{ marginBottom: "32px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <span className="product-badge">{product.category}</span>
                  {product.prescriptionRequired && (
                    <span className="product-badge" style={{ background: "#ef4444", marginLeft: "8px" }}>
                      Rx Required
                    </span>
                  )}
                </div>

                <h1 style={{ fontSize: "1.5rem", lineHeight: "1.3", marginBottom: "12px", color: "#0f172a", fontWeight: "600" }}>
                  {product.name}
                </h1>

                {/* Brand Logo Line */}
                {product.manufacturer && product.manufacturer !== "N/A" && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "20px",
                    paddingBottom: "16px",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontWeight: "700",
                      fontSize: "1.2rem",
                      flexShrink: 0
                    }}>
                      {product.manufacturer.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>
                        Manufactured by
                      </p>
                      <p style={{ fontSize: "1rem", color: "#1e293b", margin: "0", fontWeight: "600" }}>
                        {product.manufacturer}
                      </p>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ color: "#fbbf24", fontSize: "1rem" }}>★</span>
                    <span style={{ color: "#fbbf24", fontSize: "1rem" }}>★</span>
                    <span style={{ color: "#fbbf24", fontSize: "1rem" }}>★</span>
                    <span style={{ color: "#fbbf24", fontSize: "1rem" }}>★</span>
                    <span style={{ color: "#e5e7eb", fontSize: "1rem" }}>★</span>
                  </div>
                  <span style={{ color: "#1e293b", fontWeight: "600", fontSize: "0.95rem" }}>4.2</span>
                  <span style={{ color: "#64748b", fontSize: "0.9rem" }}>(19 Ratings & 1 Reviews)</span>
                </div>
              </div>

              {/* Pack Size Selection */}
              {product.packSize && (
                <div style={{ marginBottom: "24px" }} suppressHydrationWarning>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "12px", color: "#0f172a" }}>Pack Size (2)</h3>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ padding: "8px 16px", border: "2px solid #2563eb", background: "#ffffff", color: "#2563eb", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                      {product.packSize}
                    </div>
                    <div style={{ padding: "8px 16px", border: "2px solid #e5e7eb", background: "#ffffff", color: "#64748b", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                      {product.packSize}
                    </div>
                  </div>
                </div>
              )}

              {/* Product Highlights */}
              {product.keyBenefits && product.keyBenefits.length > 0 && (
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "12px", color: "#0f172a" }}>Product highlights</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {product.keyBenefits.slice(0, 3).map((benefit, idx) => (
                      <li key={idx} style={{ marginBottom: "8px", color: "#64748b", fontSize: "0.9rem" }}>
                        • {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: Price & CTA */}
            <div className="product-detail-right">
              <ProductDetailActions
                productId={product.id}
                productName={product.name}
                productPrice={product.price}
                productImage={product.image}
              />
              {product.prescriptionRequired && (
                <div style={{ marginTop: "16px", padding: "12px", background: "#fef2f2", borderRadius: "8px", borderLeft: "4px solid #ef4444" }}>
                  <p style={{ fontSize: "0.85rem", color: "#991b1b", margin: 0 }}>
                    ⚕️ This medicine requires a valid prescription
                  </p>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Uses & Benefits Section */}
        <section className="section" style={{ marginTop: "48px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "24px", color: "#0f172a" }}>Uses & Benefits</h2>
          <div className="content-grid two-col">
            {product.uses && product.uses !== "N/A" && (
              <article className="content-card">
                <h3 style={{ fontSize: "1rem", marginBottom: "12px", fontWeight: "600" }}>✓ Uses</h3>
                <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "0.95rem" }}>{cleanText(product.uses, 300)}</p>
              </article>
            )}
            {product.benefits && product.benefits !== "N/A" && (
              <article className="content-card">
                <h3 style={{ fontSize: "1rem", marginBottom: "12px", fontWeight: "600" }}>✓ Benefits</h3>
                <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "0.95rem" }}>{product.benefits}</p>
              </article>
            )}
            {product.howItWorks && product.howItWorks !== "N/A" && (
              <article className="content-card">
                <h3 style={{ fontSize: "1rem", marginBottom: "12px", fontWeight: "600" }}>How It Works</h3>
                <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "0.95rem" }}>{product.howItWorks}</p>
              </article>
            )}
            {product.usage && product.usage !== "N/A" && (
              <article className="content-card">
                <h3 style={{ fontSize: "1rem", marginBottom: "12px", fontWeight: "600" }}>How to Use</h3>
                <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "0.95rem" }}>{product.usage}</p>
              </article>
            )}
          </div>
        </section>

        {/* Product Information Section */}
        <section className="section" style={{ marginTop: "48px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "24px", color: "#0f172a" }}>Product Information</h2>
          <div className="content-grid two-col">
            {product.composition && product.composition !== "N/A" && (
              <article className="content-card">
                <h3 style={{ fontSize: "1rem", marginBottom: "12px", fontWeight: "600" }}>Chemical Composition</h3>
                <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "0.95rem" }}>{product.composition}</p>
              </article>
            )}
            {product.therapeuticClass && product.therapeuticClass !== "N/A" && (
              <article className="content-card">
                <h3 style={{ fontSize: "1rem", marginBottom: "12px", fontWeight: "600" }}>Therapeutic Class</h3>
                <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "0.95rem" }}>{product.therapeuticClass}</p>
              </article>
            )}
            {product.actionClass && product.actionClass !== "N/A" && (
              <article className="content-card">
                <h3 style={{ fontSize: "1rem", marginBottom: "12px", fontWeight: "600" }}>Action Class</h3>
                <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "0.95rem" }}>{product.actionClass}</p>
              </article>
            )}
            {product.drugType && product.drugType !== "N/A" && (
              <article className="content-card">
                <h3 style={{ fontSize: "1rem", marginBottom: "12px", fontWeight: "600" }}>Drug Type</h3>
                <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "0.95rem" }}>{product.drugType}</p>
              </article>
            )}
            {product.packSize && product.packSize !== "N/A" && (
              <article className="content-card">
                <h3 style={{ fontSize: "1rem", marginBottom: "12px", fontWeight: "600" }}>Pack Size</h3>
                <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "0.95rem" }}>{product.packSize}</p>
              </article>
            )}
            {product.storage && product.storage !== "N/A" && (
              <article className="content-card">
                <h3 style={{ fontSize: "1rem", marginBottom: "12px", fontWeight: "600" }}>Storage Conditions</h3>
                <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "0.95rem" }}>{product.storage}</p>
              </article>
            )}
          </div>
        </section>

        {/* Substitutes Section */}
        {product.substituteCount && product.substituteCount !== "0" && product.substituteList && product.substituteList !== "N/A" && (
          <section className="section" style={{ marginTop: "48px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "24px", color: "#0f172a" }}>Similar Substitutes ({product.substituteCount})</h2>
            <article className="content-card">
              <div style={{ color: "#64748b", lineHeight: "1.8", fontSize: "0.95rem", maxHeight: "400px", overflowY: "auto" }}>
                {product.substituteList.split(";").slice(0, 5).map((substitute, idx) => (
                  <div key={idx} style={{ paddingBottom: "12px", borderBottom: idx < 4 ? "1px solid #e2e8f0" : "none" }}>
                    {substitute.trim()}
                  </div>
                ))}
              </div>
            </article>
          </section>
        )}
      </div>
    </section>
  );
}

// Helper function to clean text
function cleanText(text, maxLength = 300) {
  if (!text || text === "N/A") return "";
  const cleaned = text.replace(/<[^>]*>/g, "").trim();
  if (maxLength && cleaned.length > maxLength) {
    return cleaned.substring(0, maxLength) + "...";
  }
  return cleaned;
}





