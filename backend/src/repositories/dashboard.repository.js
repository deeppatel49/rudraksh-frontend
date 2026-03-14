import { getSupabaseClient } from "../config/supabase.js";

function isMissingTableError(error) {
  const message = String(error?.message || "");
  return message.includes("Could not find the table 'public.");
}

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

async function getExactCount(tableName) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { count, error } = await withTimeout(
    supabase.from(tableName).select("id", { count: "exact", head: true }),
    8000,
    `Timed out while fetching count for ${tableName}.`
  );

  if (error) {
    if (isMissingTableError(error)) {
      return 0;
    }
    throw new Error(error.message || `Unable to fetch count for ${tableName}.`);
  }

  return Number(count) || 0;
}

export async function getDashboardCounts() {
  const [products, reviews, contacts, homePages, aboutPages] = await Promise.all([
    getExactCount("products").catch(() => 0),
    getExactCount("reviews").catch(() => 0),
    getExactCount("contact_submissions").catch(() => 0),
    getExactCount("home_content").catch(() => 0),
    getExactCount("about_content").catch(() => 0),
  ]);

  return {
    products,
    reviews,
    contacts,
    pages: homePages + aboutPages,
  };
}

export async function getAverageRating() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return 0;
  }

  try {
    const { data, error } = await withTimeout(
      supabase.from("reviews").select("rating"),
      8000,
      "Timed out while fetching average rating."
    );

    if (error) {
      if (isMissingTableError(error)) {
        return 0;
      }
      console.error("Error fetching average rating:", error);
      return 0;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    const sum = data.reduce((acc, review) => acc + (Number(review.rating) || 0), 0);
    return sum / data.length;
  } catch (error) {
    console.error("Error fetching average rating:", error);
    return 0;
  }
}
