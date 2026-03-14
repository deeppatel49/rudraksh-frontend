import { ProductGrid } from "../components/product-grid";
import { fetchProducts } from "../lib/supabase-client";
import { HomeSearchStrip } from "../components/home-search-strip";
import { createBackendApiUrl } from "../lib/backend-api";
import { getCachedMedicines } from "../data/medicines";
import { products as staticProducts } from "../data/products";

export const metadata = {
  title: "Buy Medicines & Healthcare Products Online | Rudraksh Pharmacy",
  description:
    "Shop from 2,500+ genuine medicines, wellness supplements, and medical devices at Rudraksh Pharmacy. Verified products, licensed pharmacists, and fast delivery across Surat.",
  keywords: [
    "buy medicines online",
    "online pharmacy India",
    "OTC medicines",
    "wellness supplements",
    "medical devices online",
    "Rudraksh Pharmacy products",
    "genuine medicines Surat",
  ],
  openGraph: {
    title: "Buy Medicines & Healthcare Products Online | Rudraksh Pharmacy",
    description: "Shop from 2,500+ verified products with fast delivery and expert support.",
    type: "website",
    url: "https://rudrakshpharmacy.com/products",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Medicines & Healthcare Products Online",
    description: "Shop from 2,500+ verified products at Rudraksh Pharmacy.",
  },
  alternates: {
    canonical: "/products",
  },
};

async function getCatalogFromBackend(initialCategory, initialQuery) {
  const params = new URLSearchParams();
  params.set("cat", initialCategory);
  if (initialQuery) {
    params.set("q", initialQuery);
  }
  params.set("page", "1");
  params.set("limit", "500");

  try {
    const response = await fetch(createBackendApiUrl(`/products?${params.toString()}`), {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return Array.isArray(payload?.products) ? payload.products : null;
  } catch {
    return null;
  }
}

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const categoryParam = resolvedSearchParams?.cat;
  const queryParam = resolvedSearchParams?.q;

  const initialCategory =
    typeof categoryParam === "string" && categoryParam.trim() ? categoryParam : "All";
  const initialQuery = typeof queryParam === "string" ? queryParam : "";

  // Fetch all products from Supabase database
  let allProducts = [];
  let totalProducts = 0;
  let fetchError = null;
  
  try {
    const result = await fetchProducts({
      page: 1,
      limit: 500,
      category: initialCategory,
      query: initialQuery,
      includeTotal: true,
    });
    allProducts = result.products || [];
    totalProducts = result.total || 0;
  } catch (error) {
    console.error("Error fetching products from Supabase:", error);
    fetchError = error.message || "Failed to load products from Supabase";
  }

  if (allProducts.length === 0) {
    const backendProducts = await getCatalogFromBackend(initialCategory, initialQuery);

    if (Array.isArray(backendProducts) && backendProducts.length > 0) {
      allProducts = backendProducts;
      totalProducts = backendProducts.length;
      fetchError = null;
    } else {
      // Final fallback for local development or transient upstream issues.
      const localFallbackProducts = [...getCachedMedicines(), ...staticProducts];
      allProducts = localFallbackProducts;
      totalProducts = localFallbackProducts.length;
      fetchError = null;
    }
  }

  return (
    <section className="products-page">
      <div className="products-page-hero">
        <div className="container products-page-hero-inner">
          <div className="products-hero-main">
            <p className="products-page-kicker">Rudraksh Pharmacy Catalog</p>
            <h1>Products for Everyday Health Needs</h1>
            <p>
              Discover trusted medicines, wellness essentials, and first-aid products
              selected for safety, quality, and reliable care.
            </p>
            <div className="products-page-actions">
              <a href="#products-list" className="primary-btn">Browse Products</a>
            </div>
            <div className="products-page-trust">
              <span>Genuine Products</span>
              <span>Verified Sources</span>
              <span>Pharmacist Support</span>
            </div>
          </div>

          <aside className="products-hero-side" aria-label="Service highlights">
            <h2>Why Customers Choose Us</h2>
            <ul>
              <li>
                <strong>Wide Assortment</strong>
                <span>Over {totalProducts}+ medicines plus wellness, Ayurvedic, and first-aid essentials from our database.</span>
              </li>
              <li>
                <strong>Prescription Support</strong>
                <span>Upload your prescription and get assistance from our team.</span>
              </li>
              <li>
                <strong>Simple Checkout</strong>
                <span>Quick cart flow designed for smooth repeat orders.</span>
              </li>
            </ul>
          </aside>
        </div>
      </div>

      <HomeSearchStrip />

      {fetchError && (
        <div className="container" style={{ marginTop: "2rem" }}>
          <div style={{
            padding: "1rem",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "8px",
            color: "#c33"
          }}>
            <strong>Error loading products:</strong> {fetchError}
          </div>
        </div>
      )}

      {!fetchError && allProducts.length === 0 && (
        <div className="container" style={{ marginTop: "2rem" }}>
          <div style={{
            padding: "1rem",
            backgroundColor: "#fff4e6",
            border: "1px solid #ffb84d",
            borderRadius: "8px",
            color: "#9a5518"
          }}>
            <strong>No products found in database.</strong> Make sure your Supabase products table has data.
          </div>
        </div>
      )}

      {!fetchError && allProducts.length > 0 && (
        <div className="container" style={{ marginTop: "1rem", marginBottom: "1rem", padding: "0.5rem", fontSize: "0.9rem", color: "#666" }}>
          ✓ Successfully loaded {allProducts.length} products from database (Total: {totalProducts})
        </div>
      )}

      <section className="container products-overview-strip" aria-label="Products overview">
        <article className="products-overview-item">
          <h3>Curated Categories</h3>
          <p>Browse by category to quickly find what you need.</p>
        </article>
        <article className="products-overview-item">
          <h3>Trusted Brands</h3>
          <p>Handpicked brand portfolio focused on quality care.</p>
        </article>
        <article className="products-overview-item">
          <h3>Prescription Ready</h3>
          <p>Secure upload process for prescribed medicines.</p>
        </article>
      </section>
      <ProductGrid
        key={`${initialCategory}-${initialQuery}`}
        initialCategory={initialCategory}
        initialQuery={initialQuery}
        allProducts={allProducts}
      />
    </section>
  );
}
