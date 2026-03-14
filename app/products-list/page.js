import { fetchProducts } from "../lib/supabase-client";

export const metadata = {
  title: "Products Inventory | Rudraksh Pharmacy",
  description: "View complete inventory of medicines and healthcare products available at Rudraksh Pharmacy.",
  alternates: {
    canonical: "/products-list",
  },
};

export default async function ProductsListPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const category = resolvedSearchParams?.category || null;
  const query = resolvedSearchParams?.query || null;

  let allProducts = [];
  let totalProducts = 0;
  let error = null;

  try {
    const result = await fetchProducts({ page, limit: 100, category, query });
    allProducts = result.products || [];
    totalProducts = result.total || 0;
  } catch (err) {
    error = err.message || "Failed to fetch products from database";
    console.error("Error fetching products:", err);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-2">Products Inventory</h1>
          <p className="text-blue-100">Complete list of medicines and healthcare products available at Rudraksh Pharmacy</p>
          <p className="text-sm text-blue-100 mt-2">Total Products: <span className="font-bold">{totalProducts}</span></p>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-100 border border-red-400 rounded-lg">
          <p className="text-red-700 font-semibold">Error loading products</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Products Table Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm sticky left-0 bg-gray-100 z-10 w-12">
                      SrNo
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm min-w-48">
                      Item Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm min-w-40">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm min-w-40">
                      Generic
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm min-w-32">
                      ItemType
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm min-w-32">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm min-w-40">
                      Pack
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 text-sm min-w-24 sticky right-0 bg-gray-100 z-10">
                      MRP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allProducts.length > 0 ? (
                    allProducts.map((product, index) => (
                      <tr
                        key={product.id || index}
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-700 text-sm font-medium sticky left-0 z-10 bg-inherit">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-gray-700 text-sm font-medium max-w-xs truncate" title={product.name}>
                          {product.name || "Untitled product"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm max-w-xs truncate" title={product.manufacturer}>
                          {product.manufacturer || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm max-w-xs truncate" title={product.composition}>
                          {product.composition || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {product.drug_type || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {product.category || "Medicine"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {product.pack_size || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-600 text-sm sticky right-0 bg-inherit">
                          ₹{Number(product.price || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-600">
                        No products available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Summary */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
                <p className="text-gray-600 text-sm">Total Products</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {allProducts.filter(p => p.in_stock !== false).length}
                </p>
                <p className="text-gray-600 text-sm">In Stock</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {new Set(allProducts.map(p => p.manufacturer || "Unknown")).size}
                </p>
                <p className="text-gray-600 text-sm">Companies</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {new Set(allProducts.map(p => p.category || "Uncategorized")).size}
                </p>
                <p className="text-gray-600 text-sm">Categories</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Link */}
      <section className="py-6 text-center">
        <a
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <span>← Back to Products</span>
        </a>
      </section>
    </main>
  );
}
