"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAdminUser, signInAdmin, signOutAdmin, signUpAdmin } from "../lib/admin-api";

const AdminAuthContext = createContext(null);

const ADMIN_TOKEN_KEY = "rudraksh_admin_token";
const ADMIN_USER_KEY = "rudraksh_admin_user";

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem(ADMIN_TOKEN_KEY);
        const cachedUser = localStorage.getItem(ADMIN_USER_KEY);

        if (token) {
          try {
            // Verify token is still valid
            const response = await getAdminUser(token);
            setAdminUser(response.user);
            // Update cached user
            localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(response.user));
          } catch (error) {
            // Token invalid or expired, clear storage
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            localStorage.removeItem(ADMIN_USER_KEY);
            setAdminUser(null);
          }
        } else if (cachedUser) {
          // No token but has cached user, clear it
          localStorage.removeItem(ADMIN_USER_KEY);
        }
      } catch (error) {
        console.error("Failed to restore admin session:", error);
      } finally {
        setIsLoading(false);
        setIsHydrated(true);
      }
    };

    restoreSession();
  }, []);

  const signup = async (fullName, email, password) => {
    try {
      const response = await signUpAdmin({ fullName, email, password });

      // Store token and user
      localStorage.setItem(ADMIN_TOKEN_KEY, response.token);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(response.user));
      setAdminUser(response.user);

      return { success: true, user: response.user };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to sign up. Please try again.",
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await signInAdmin({ email, password });

      // Store token and user
      localStorage.setItem(ADMIN_TOKEN_KEY, response.token);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(response.user));
      setAdminUser(response.user);

      return { success: true, user: response.user };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to sign in. Please try again.",
      };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (token) {
        await signOutAdmin(token);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      setAdminUser(null);
    }
  };

  const getToken = () => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  };

  const value = {
    adminUser,
    isLoading,
    isHydrated,
    isAuthenticated: !!adminUser,
    signup,
    login,
    logout,
    getToken,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
