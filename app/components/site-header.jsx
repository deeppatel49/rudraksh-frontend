"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { useCart } from "../context/cart-context";
import { ChevronDown, LogOut, User, FileText, Package } from "lucide-react";

const navLinks = [
  { href: "/about", label: "ABOUT" },
  { href: "/store-locator", label: "STORE LOCATOR" },
  { href: "/products", label: "MEDICINES" },
  { href: "/contact", label: "CONTACT" },
];

function HeaderIcon({ kind }) {
  if (kind === "cart") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="pro-header-icon">
        <path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H7.2" />
        <circle cx="10" cy="19" r="1.4" />
        <circle cx="17" cy="19" r="1.4" />
      </svg>
    );
  }

  if (kind === "user") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="pro-header-icon">
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.5 18.5c1.2-2.8 3.5-4.2 6.5-4.2s5.3 1.4 6.5 4.2" />
      </svg>
    );
  }

  return null;
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isHydrated: isAuthHydrated } = useAuth();
  const { itemCount, isHydrated: isCartHydrated } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isUserDropdownOpen) return;

    const handlePointerDownOutside = (event) => {
      const clickedInsideDropdown =
        event.target instanceof Element
          ? event.target.closest(".pro-user-dropdown")
          : null;
      if (!clickedInsideDropdown) {
        setIsUserDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDownOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDownOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isUserDropdownOpen]);

  const isActive = (href) => {
    const [pathOnly] = href.split("?");
    return pathname === pathOnly;
  };
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const closeUserDropdown = () => setIsUserDropdownOpen(false);

  const handleMenuNavigation = () => {
    closeUserDropdown();
    closeMobileMenu();
  };

  const handleLogout = () => {
    closeUserDropdown();
    logout();
    closeMobileMenu();
    router.push("/login");
    router.refresh();
  };

  const medicinesHref = "/products";

  const renderNavLinks = () =>
    navLinks.map((link) => (
      (() => {
        const resolvedHref = link.href === "/products" ? medicinesHref : link.href;
        return (
      <Link
        key={link.href}
        href={resolvedHref}
        className={`pro-nav-link ${isActive(link.href) ? "active" : ""}`}
        onClick={handleMenuNavigation}
      >
        {link.label}
      </Link>
        );
      })()
    ));

  const renderActionLinks = () => (
    <>
      <div className="pro-account">
        {isAuthHydrated && user ? (
          <div className="pro-user-dropdown">
            {/* User Menu Button */}
            <button
              type="button"
              className={`pro-account-btn pro-icon-btn pro-user-menu-trigger ${isUserDropdownOpen ? "active" : ""}`}
              aria-label="User menu"
              title={user?.name || "User Menu"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsUserDropdownOpen(!isUserDropdownOpen);
              }}
              aria-expanded={isUserDropdownOpen}
              aria-haspopup="menu"
            >
              <HeaderIcon kind="user" />
              <ChevronDown className="pro-dropdown-arrow" size={14} />
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="pro-user-menu" role="menu">
                {/* User Info */}
                <div className="pro-user-info">
                  <p className="pro-user-name">{user?.name || "User"}</p>
                  <p className="pro-user-email">{user?.email || user?.mobileNumber}</p>
                </div>

                <div className="pro-menu-divider" />

                {/* Menu Items */}
                <Link
                  href="/profile"
                  className="pro-menu-item"
                  role="menuitem"
                  onClick={handleMenuNavigation}
                >
                  <User size={16} />
                  <span>Profile</span>
                </Link>

                <Link
                  href="/orders"
                  className="pro-menu-item"
                  role="menuitem"
                  onClick={handleMenuNavigation}
                >
                  <FileText size={16} />
                  <span>Orders</span>
                </Link>

                <Link
                  href="/products"
                  className="pro-menu-item"
                  role="menuitem"
                  onClick={handleMenuNavigation}
                >
                  <Package size={16} />
                  <span>Medicines</span>
                </Link>

                <div className="pro-menu-divider" />

                {/* Logout */}
                <button
                  type="button"
                  className="pro-menu-item pro-logout-item"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="pro-account-btn pro-icon-btn"
            aria-label="Login"
            title="Login"
            onClick={closeMobileMenu}
          >
            <HeaderIcon kind="user" />
          </Link>
        )}
      </div>

      <Link
        href="/cart"
        className="pro-cart-link pro-icon-btn"
        aria-label="Cart"
        title="Cart"
        onClick={closeMobileMenu}
      >
        <HeaderIcon kind="cart" />
        {isCartHydrated && itemCount > 0 ? <span className="pro-cart-badge">{itemCount}</span> : null}
      </Link>
    </>
  );

  return (
    <header className={`pro-site-header ${isMobileMenuOpen ? "open" : ""}`}>
      <div className="pro-header-inner container">
        <Link href="/" className="pro-brand-logo" aria-label="Rudraksh Pharmacy home">
          <Image
            src="/rudraksha-logo-v2.png"
            alt="Rudraksh Pharmacy logo"
            width={56}
            height={56}
            priority
          />
          <div className="pro-brand-text">
            <strong>Rudraksh</strong>
            <span>Pharmacy</span>
          </div>
        </Link>

        <nav className="pro-main-nav" aria-label="Primary navigation">
          {renderNavLinks()}
        </nav>

        <div className="pro-header-right">{renderActionLinks()}</div>

        <button
          type="button"
          className={`pro-mobile-toggle ${isMobileMenuOpen ? "active" : ""}`}
          aria-label="Toggle header menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="pro-header-menu"
          onClick={() => setIsMobileMenuOpen((previous) => !previous)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div id="pro-header-menu" className="pro-header-menu container">
        <nav className="pro-nav-stack" aria-label="Mobile navigation">
          {renderNavLinks()}
        </nav>
        <div className="pro-action-stack">{renderActionLinks()}</div>
      </div>
    </header>
  );
}
