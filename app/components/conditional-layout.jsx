"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { WhatsAppFloat } from "./whatsapp-float";
import { CartSidebar } from "./cart-sidebar";

export function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    // Admin routes: no header/footer
    return <>{children}</>;
  }

  // Regular routes: with header/footer
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="site-main">{children}</main>
      <CartSidebar />
      <WhatsAppFloat />
      <SiteFooter />
    </div>
  );
}
