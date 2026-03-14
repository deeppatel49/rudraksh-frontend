"use client";

import Link from "next/link";
import { ProductDetailActions } from "./product-detail-actions";
import { ProductDetailImage } from "./product-detail-image";

export function ProductDetailView({ product, productId }) {

  if (!product) {
    return (
      <section className="section section-soft">
        <div className="container">
          <div style={{
            padding: "48px 24px",
            textAlign: "center"
          }}>
            <div style={{ marginBottom: "16px", fontSize: "2rem" }}>🔍</div>
            <h2 style={{ marginBottom: "12px" }}>Product Not Found</h2>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>The product you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/products" style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600"
            }}>
              ← Back to Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Product structured data for SEO
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.generic
      ? `${product.name} - Generic: ${product.generic}`
      : `${product.name} available at Rudraksh Pharmacy`,
    "brand": {
      "@type": "Brand",
      "name": product.manufacturer || "Rudraksh Pharmacy"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://rudrakshpharmacy.com/products/${product.id}`,
      "priceCurrency": "INR",
      "price": product.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Rudraksh Pharmacy"
      }
    },
    "category": product.category,
  };

  return (
    <section className="section section-soft">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb-nav" style={{ marginBottom: "24px" }}>
          <Link href="/products" style={{ color: "#2563eb", textDecoration: "underline" }}>
            Products
          </Link>
          <span style={{ margin: "0 8px", color: "#64748b" }}>/</span>
          <span style={{ color: "#475569" }}>{product.name}</span>
        </div>

        <article className="product-detail-card">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1.5fr", gap: "32px", marginTop: "32px" }}>

            {/* Left: Image */}
            <div className="product-gallery-left">
              <ProductDetailImage product={product} />
            </div>

            {/* Center: Product Info */}
            <div className="product-detail-center">
              <div style={{ marginBottom: "32px" }}>

                {/* Badges */}
                <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {product.category && (
                    <span className="product-badge">{product.category}</span>
                  )}
                  {product.itemType && product.itemType !== "N/A" && (
                    <span className="product-badge" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #86efac" }}>
                      {product.itemType}
                    </span>
                  )}
                </div>

                {/* Product Name */}
                <h1 style={{ fontSize: "1.5rem", lineHeight: "1.3", marginBottom: "12px", color: "#0f172a", fontWeight: "600" }}>
                  {product.name}
                </h1>

                {/* Manufacturer */}
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

                {/* Generic Name / Composition */}
                {product.generic && product.generic !== "N/A" && (
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "0.85rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                      Generic Name / Composition
                    </h3>
                    <p style={{ fontSize: "0.95rem", color: "#1e293b", margin: 0, lineHeight: "1.5" }}>
                      {product.generic}
                    </p>
                  </div>
                )}

                {/* Pack Size */}
                {product.pack && product.pack !== "N/A" && (
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "10px", color: "#0f172a" }}>Pack Size</h3>
                    <div style={{ padding: "8px 16px", border: "2px solid #2563eb", background: "#ffffff", color: "#2563eb", borderRadius: "8px", display: "inline-block", fontWeight: "600" }}>
                      {product.pack}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Right: Price & CTA */}
            <div className="product-detail-right">
              <ProductDetailActions
                productId={product.id}
                productName={product.name}
                productPrice={product.price}
                productImage={product.image}
              />
              <div style={{ marginTop: "16px", padding: "12px", background: "#f8fafc", borderRadius: "8px", borderLeft: "4px solid #2563eb" }}>
                <p style={{ fontSize: "0.85rem", color: "#334155", margin: 0 }}>
                  🏥 Consult a licensed pharmacist before use
                </p>
              </div>
            </div>

          </div>
        </article>

        {/* Product Details Table */}
        <section className="section" style={{ marginTop: "48px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "24px", color: "#0f172a" }}>Product Details</h2>
          <article className="content-card">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  { label: "Product Name", value: product.name },
                  { label: "Generic Name", value: product.generic },
                  { label: "Manufacturer / Company", value: product.manufacturer },
                  { label: "Item Type", value: product.itemType },
                  { label: "Category", value: product.category },
                  { label: "Pack Size", value: product.pack },
                  { label: "MRP", value: product.price ? `₹${Number(product.price).toFixed(2)}` : null },
                  { label: "Product ID (SrNo)", value: product.srNo || product.id },
                ].filter((row) => row.value && String(row.value) !== "N/A").map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <th style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#475569",
                      width: "35%",
                      background: "#f8fafc",
                      verticalAlign: "top"
                    }}>
                      {row.label}
                    </th>
                    <td style={{
                      padding: "14px 16px",
                      fontSize: "0.9rem",
                      color: "#1e293b",
                      lineHeight: "1.6"
                    }}>
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </section>

      </div>
    </section>
  );
}
