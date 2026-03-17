import "./globals.css";
import { Manrope, Sora } from "next/font/google";
import { AuthProvider } from "./context/auth-context";
import { AdminAuthProvider } from "./context/admin-auth-context";
import { CartProvider } from "./context/cart-context";
import { ConditionalLayout } from "./components/conditional-layout";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata = {
  metadataBase: new URL("https://rudrakshpharmacy.com"),
  title: {
    default: "Rudraksh Pharmacy | Trusted Online Medical Store",
    template: "%s | Rudraksh Pharmacy",
  },
  description:
    "Rudraksh Pharmacy provides reliable medicine delivery, wellness products, and licensed pharmacist support with a secure online shopping experience.",
  keywords: [
    "Rudraksh Pharmacy",
    "online pharmacy",
    "medicine delivery",
    "healthcare products",
    "trusted pharmacy",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "healthcare",
  openGraph: {
    title: "Rudraksh Pharmacy | Trusted Online Medical Store",
    description:
      "Order medicines and wellness essentials from Rudraksh Pharmacy with fast delivery and expert support.",
    url: "https://rudrakshpharmacy.com",
    siteName: "Rudraksh Pharmacy",
    images: [{ url: "/rudraksha-logo-v2.png", width: 1200, height: 1200 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rudraksh Pharmacy",
    description:
      "Secure and reliable online pharmacy for medicines and health essentials.",
    images: ["/rudraksha-logo-v2.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Pharmacy",
  name: "Rudraksh Pharmacy",
  image: "https://rudrakshpharmacy.com/rudraksha-logo-v2.png",
  url: "https://rudrakshpharmacy.com",
  telephone: "+91 99799 79688",
  email: "rudrakshpharmacy6363@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Surat",
    addressRegion: "Gujarat",
    addressCountry: "IN",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "22:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "09:00",
      closes: "14:00",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sora.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <AdminAuthProvider>
          <AuthProvider>
            <CartProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
            </CartProvider>
          </AuthProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
