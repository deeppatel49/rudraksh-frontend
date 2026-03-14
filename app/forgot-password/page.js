import { Suspense } from "react";
import { ForgotPasswordFlow } from "../components/forgot-password-flow";

export const metadata = {
  title: "Forgot Password | Reset Account | Rudraksh Pharmacy",
  description: "Recover your Rudraksh Pharmacy account with secure OTP verification. Reset your password safely and regain access to your orders and prescriptions.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/forgot-password",
  },
};

export default function ForgotPasswordPage() {
  return (
    <section className="section container">
      <Suspense fallback={null}>
        <ForgotPasswordFlow />
      </Suspense>
    </section>
  );
}
