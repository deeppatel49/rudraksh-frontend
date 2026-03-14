"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createBackendApiUrl } from "../lib/backend-api";

const AuthContext = createContext(null);
const LEGACY_STORAGE_KEY = "rudraksha_auth_user";
const CURRENT_USER_KEY = "rudraksha_auth_current_user_id";
const AUTH_COOKIE_KEY = "rudraksh_auth_user_id";
const REQUIRED_PROFILE_FIELDS = [
  "fullName",
  "mobileNumber",
  "whatsappNumber",
  "email",
  "address",
  "city",
  "pincode",
];

function isProfileComplete(profile) {
  const customerProfile = profile?.customerProfile || {};
  return REQUIRED_PROFILE_FIELDS.every((field) => String(customerProfile[field] || "").trim());
}

function toProfileRecord(sessionUser) {
  if (!sessionUser?.id) {
    return null;
  }

  const customerProfile = sessionUser.customerProfile || {
    fullName: sessionUser.fullName || sessionUser.name || "",
    gender: sessionUser.gender || "",
    mobileNumber: sessionUser.mobileNumber || sessionUser.phone || "",
    whatsappNumber: sessionUser.whatsappNumber || sessionUser.phone || "",
    email: sessionUser.email || "",
    address: sessionUser.address || "",
    city: sessionUser.city || "",
    pincode: sessionUser.pincode || "",
  };

  return {
    id: sessionUser.id,
    userId: sessionUser.id,
    name: sessionUser.name || customerProfile.fullName || "Customer",
    email: sessionUser.email || customerProfile.email || "",
    phone: sessionUser.phone || customerProfile.mobileNumber || "",
    customerProfile,
  };
}

async function callBackendJson(pathname, options = {}) {
  const response = await fetch(createBackendApiUrl(pathname), {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Request failed.");
  }

  return payload;
}

function setAuthSessionUserId(userId) {
  const safeUserId = String(userId || "").trim();
  if (!safeUserId) {
    return;
  }

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(CURRENT_USER_KEY, safeUserId);
    window.localStorage.removeItem(CURRENT_USER_KEY);
    document.cookie = `${AUTH_COOKIE_KEY}=${encodeURIComponent(safeUserId)}; Path=/; SameSite=Lax`;
  }
}

function clearAuthSessionUserId() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(CURRENT_USER_KEY);
    window.localStorage.removeItem(CURRENT_USER_KEY);
    document.cookie = `${AUTH_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}

function readAuthSessionUserId() {
  if (typeof window === "undefined") {
    return "";
  }

  const fromSession = String(window.sessionStorage.getItem(CURRENT_USER_KEY) || "").trim();
  if (fromSession) {
    return fromSession;
  }

  // One-time migration for users who still have old localStorage sessions.
  const fromLocal = String(window.localStorage.getItem(CURRENT_USER_KEY) || "").trim();
  if (fromLocal) {
    setAuthSessionUserId(fromLocal);
    return fromLocal;
  }

  return "";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    async function restore() {
      try {
        // Clear obsolete legacy key, if present.
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);

        const currentUserId = readAuthSessionUserId();
        if (!currentUserId) {
          return;
        }

        const payload = await callBackendJson(`/customer-auth/session?userId=${encodeURIComponent(currentUserId)}`);
        if (!active || !payload?.user?.id) {
          return;
        }

        setUser(payload.user);
        setCurrentProfile(toProfileRecord(payload.user));
      } catch {
        clearAuthSessionUserId();
        if (active) {
          setUser(null);
          setCurrentProfile(null);
        }
      } finally {
        if (active) {
          setIsHydrated(true);
        }
      }
    }

    void restore();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => {
    const applySessionPayload = (payload, persistUserId = true) => {
      const sessionUser = payload?.user || null;
      if (!sessionUser?.id) {
        throw new Error("Invalid auth response.");
      }

      if (persistUserId) {
        setAuthSessionUserId(sessionUser.id);
      }

      setUser(sessionUser);
      const profileRecord = toProfileRecord(sessionUser);
      setCurrentProfile(profileRecord);
      return sessionUser;
    };

    const login = async (payload) => {
      const loginMethod = String(payload?.loginMethod || "manual").trim().toLowerCase();
      if (loginMethod !== "google") {
        throw new Error("Use password sign-in for manual login.");
      }

      const response = await callBackendJson("/customer-auth/login/google", {
        method: "POST",
        body: JSON.stringify({
          name: payload?.name || "Google User",
          email: String(payload?.email || "").trim().toLowerCase(),
          identifier: payload?.identifier || payload?.email || "",
        }),
      });

      return applySessionPayload(response);
    };

    const registerWithPassword = async ({ name, identifier, mobileNumber, password }) => {
      const response = await callBackendJson("/customer-auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          identifier,
          mobileNumber,
          password,
        }),
      });

      return response.user;
    };

    const loginWithPassword = async ({ identifier, password }) => {
      const response = await callBackendJson("/customer-auth/login/password", {
        method: "POST",
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      return applySessionPayload(response);
    };

    const resetPassword = async ({ identifier, newPassword }) => {
      const response = await callBackendJson("/customer-auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          identifier,
          newPassword,
        }),
      });

      return response.user;
    };

    const accountExistsForIdentifier = async (identifier) => {
      const response = await callBackendJson(`/customer-auth/account-exists?identifier=${encodeURIComponent(identifier)}`);
      return Boolean(response?.exists);
    };

    const getRecoveryContactsForIdentifier = async (identifier) => {
      try {
        const response = await callBackendJson(`/customer-auth/recovery-contacts?identifier=${encodeURIComponent(identifier)}`);
        return response?.contacts || null;
      } catch {
        return null;
      }
    };

    const logout = () => {
      setUser(null);
      setCurrentProfile(null);
      clearAuthSessionUserId();
    };

    const getCurrentProfile = () => currentProfile;

    const hasCompletedProfile = () => isProfileComplete(currentProfile);

    const updateCustomerProfile = async (payload) => {
      if (!user?.id) {
        throw new Error("Please sign in first.");
      }

      const response = await callBackendJson("/customer-auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          userId: user.id,
          fullName: String(payload?.fullName || "").trim(),
          gender: String(payload?.gender || "").trim(),
          mobileNumber: String(payload?.mobileNumber || "").trim(),
          whatsappNumber: String(payload?.whatsappNumber || "").trim(),
          email: String(payload?.email || "").trim().toLowerCase(),
          address: String(payload?.address || "").trim(),
          city: String(payload?.city || "").trim(),
          pincode: String(payload?.pincode || "").trim(),
        }),
      });

      const sessionUser = applySessionPayload(response, false);
      return {
        ...response.profile,
        customerProfile: toProfileRecord(sessionUser)?.customerProfile || null,
      };
    };

    return {
      user,
      login,
      registerWithPassword,
      loginWithPassword,
      resetPassword,
      accountExistsForIdentifier,
      getRecoveryContactsForIdentifier,
      logout,
      getCurrentProfile,
      hasCompletedProfile,
      updateCustomerProfile,
      isHydrated,
    };
  }, [user, currentProfile, isHydrated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
