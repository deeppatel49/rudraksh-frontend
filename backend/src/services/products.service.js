import { getProductById, listProducts, updateProductById } from "../repositories/products.repository.js";

function normalizeProduct(row) {
  const srNo = row.SrNo;
  const itemName = row.Item_Name || "Untitled product";
  const company = row.Company || "N/A";
  const generic = row.Generic || "N/A";
  const itemType = row.ItemType || "Tablet";
  const category = row.Category || "Medicine";
  const pack = row.Pack || "";
  const mrp = Number(row.Mrp) || 0;

  return {
    srNo,
    itemName,
    company,
    generic,
    itemType,
    category,
    pack,
    mrp,
    id: srNo,
    name: itemName,
    manufacturer: company,
    composition: generic,
    drug_type: itemType,
    pack_size: pack,
    price: mrp,
  };
}

export async function fetchProducts(params) {
  const result = await listProducts(params);
  const hasTotal = Number.isFinite(result.total);

  return {
    products: result.rows.map(normalizeProduct),
    pagination: {
      page: result.page,
      limit: result.limit,
      total: hasTotal ? result.total : null,
      totalPages: hasTotal ? Math.max(1, Math.ceil(result.total / result.limit)) : null,
    },
  };
}

export async function fetchProductById(productId) {
  const row = await getProductById(productId);
  return row ? normalizeProduct(row) : null;
}

export async function saveProductChanges(productId, payload = {}) {
  const itemName = String(payload.itemName || payload.name || "").trim();
  const company = String(payload.company || payload.manufacturer || "").trim();
  const generic = String(payload.generic || payload.composition || "").trim();
  const itemType = String(payload.itemType || payload.drug_type || "").trim();
  const category = String(payload.category || "").trim();
  const pack = String(payload.pack || payload.pack_size || "").trim();
  const mrp = Number(payload.mrp ?? payload.price);

  if (!itemName) {
    throw new Error("Product name is required.");
  }

  if (!Number.isFinite(mrp) || mrp < 0) {
    throw new Error("MRP must be a valid non-negative number.");
  }

  const row = await updateProductById(productId, {
    Item_Name: itemName,
    Company: company || null,
    Generic: generic || null,
    ItemType: itemType || null,
    Category: category || null,
    Pack: pack || null,
    Mrp: mrp,
  });

  if (!row) {
    throw new Error("Product not found.");
  }

  return {
    message: "Product updated successfully.",
    product: normalizeProduct(row),
  };
}
