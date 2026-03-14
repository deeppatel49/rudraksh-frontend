/**
 * Admin API Client for Backend Authentication
 */

const API_PREFIX = "/api/v1";

function normalizeApiBaseUrl(rawUrl) {
  const trimmed = String(rawUrl || "").trim().replace(/\/+$/, "");
  if (!trimmed) {
    return "http://localhost:5000/api/v1";
  }

  return trimmed.endsWith(API_PREFIX) ? trimmed : `${trimmed}${API_PREFIX}`;
}

const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
);

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.error || data.message || "Request failed",
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(
      error.message || "Network error",
      0,
      { originalError: error }
    );
  }
}

/**
 * Sign up a new admin user
 * @param {Object} payload - { fullName, email, password }
 * @returns {Promise<{ token: string, user: Object }>}
 */
export async function signUpAdmin(payload) {
  return fetchAPI("/auth/sign-up", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Sign in as admin
 * @param {Object} payload - { email, password }
 * @returns {Promise<{ token: string, user: Object }>}
 */
export async function signInAdmin(payload) {
  return fetchAPI("/auth/sign-in", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Get current admin user from token
 * @param {string} token - Bearer token
 * @returns {Promise<{ user: Object }>}
 */
export async function getAdminUser(token) {
  return fetchAPI("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Sign out admin
 * @param {string} token - Bearer token
 * @returns {Promise<{ message: string }>}
 */
export async function signOutAdmin(token) {
  return fetchAPI("/auth/sign-out", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get dashboard summary
 * @param {string} token - Bearer token
 * @returns {Promise<Object>}
 */
export async function getDashboardSummary(token) {
  return fetchAPI("/dashboard/summary", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export { APIError };
