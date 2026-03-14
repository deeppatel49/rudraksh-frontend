"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchProductById,
  fetchProducts,
  fetchProductsByIds,
  fetchFeaturedProducts,
  searchProducts
} from "../lib/supabase-client";

function isValidProductId(productId) {
  const raw = String(productId ?? "").trim().toLowerCase();
  if (!raw || raw === "undefined" || raw === "null") {
    return false;
  }

  const numericId = Number(raw);
  return Number.isInteger(numericId) && numericId > 0;
}

/**
 * Hook for fetching a single product by ID
 * @param {string} productId - The product ID to fetch
 * @param {Object} options - Options for fetching
 * @returns {Object} - { product, loading, error, refetch }
 */
export function useProduct(productId, options = {}) {
  const { enabled = true } = options;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (!isValidProductId(productId)) {
      setProduct(null);
      setError("Invalid product ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchProductById(productId);
      setProduct(data);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.message || "Failed to fetch product");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId, enabled]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct
  };
}

/**
 * Hook for fetching multiple products with pagination
 * @param {Object} filters - Filters for fetching products
 * @returns {Object} - { products, total, totalPages, loading, error, refetch }
 */
export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchProducts(filters);
      setProducts(result.products || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 0);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to fetch products");
      setProducts([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    products,
    total,
    totalPages,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook for fetching products by multiple IDs
 * @param {Array} productIds - Array of product IDs to fetch
 * @param {Object} options - Options for fetching
 * @returns {Object} - { products, loading, error, refetch }
 */
export function useProductsByIds(productIds = [], options = {}) {
  const { enabled = true } = options;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!enabled || !Array.isArray(productIds) || productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchProductsByIds(productIds);
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(productIds), enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    products,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook for fetching featured products
 * @param {number} limit - Number of products to fetch
 * @returns {Object} - { products, loading, error, refetch }
 */
export function useFeaturedProducts(limit = 10) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchFeaturedProducts(limit);
      setProducts(data);
    } catch (err) {
      console.error("Error fetching featured products:", err);
      setError(err.message || "Failed to fetch featured products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    products,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook for searching products
 * @param {string} searchTerm - Search term
 * @param {Object} options - Search options
 * @returns {Object} - { products, total, loading, error, search }
 */
export function useProductSearch(searchTerm = "", options = {}) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (term) => {
    const searchStr = String(term || searchTerm || '').trim();
    
    if (!searchStr) {
      setProducts([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await searchProducts(searchStr, options);
      setProducts(result.products || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error("Error searching products:", err);
      setError(err.message || "Failed to search products");
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, JSON.stringify(options)]);

  useEffect(() => {
    if (searchTerm && searchTerm.trim()) {
      search(searchTerm);
    }
  }, [search, searchTerm]);

  return {
    products,
    total,
    loading,
    error,
    search
  };
}
