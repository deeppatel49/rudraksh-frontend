import { Suspense } from "react";
import { LoginForm } from "../components/login-form";

export const metadata = {
  title: "Login | Sign In to Your Account | Rudraksh Pharmacy",
  description: "Sign in to your Rudraksh Pharmacy account. Access order history, save prescriptions, track deliveries, and enjoy personalized healthcare shopping.",
  keywords: [
    "pharmacy login",
    "sign in",
    "customer account",
    "Rudraksh login",
    "order tracking",
  ],
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPage() {
  return (
    <section className="section container">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </section>
  );
}
