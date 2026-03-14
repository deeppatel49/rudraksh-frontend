"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/auth-context";

function isValidIdentifier(value) {
  const input = String(value || "").trim();
  const cleanDigits = input.replace(/\D/g, "");
  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  const looksLikePhone = cleanDigits.length >= 10 && cleanDigits.length <= 15;
  return looksLikeEmail || looksLikePhone;
}

export function ForgotPasswordFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, accountExistsForIdentifier, getRecoveryContactsForIdentifier } = useAuth();

  const [identifier, setIdentifier] = useState(searchParams.get("identifier") || "");
  const [otpInput, setOtpInput] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const nextPath = useMemo(() => searchParams.get("next") || "/products", [searchParams]);

  async function handleSendOtp(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const safeIdentifier = identifier.trim();
    if (!isValidIdentifier(safeIdentifier)) {
      setError("Enter a valid registered mobile number or email.");
      return;
    }
    if (!(await accountExistsForIdentifier(safeIdentifier))) {
      setError("No account found with this email or phone number. Please create an account first.");
      return;
    }

    const contacts = await getRecoveryContactsForIdentifier(safeIdentifier);
    if (!contacts) {
      setError("Registered contact details not found for this account.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: safeIdentifier,
          email: contacts.email,
          mobileNumber: contacts.mobileNumber,
          whatsappNumber: contacts.whatsappNumber,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to send OTP.");
      }

      setOtpSent(true);
      setOtpVerified(false);
      setResetToken("");
      setSuccess(payload?.message || "OTP sent successfully.");
    } catch (sendError) {
      setError(sendError?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!otpInput.trim()) {
      setError("Enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp: otpInput.trim(),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "OTP verification failed.");
      }

      setOtpVerified(true);
      setResetToken(payload.resetToken || "");
      setSuccess("OTP verified. You can now create a new password.");
    } catch (verifyError) {
      setError(verifyError?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!otpVerified || !resetToken) {
      setError("Verify OTP first.");
      return;
    }

    const safePassword = newPassword.trim();
    const safeConfirmPassword = confirmPassword.trim();
    if (safePassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (safePassword !== safeConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await resetPassword({
        identifier: identifier.trim(),
        newPassword: safePassword,
      });
      setSuccess("Password reset successful. Redirecting to sign in...");
      setTimeout(() => {
        router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      }, 900);
    } catch (resetError) {
      setError(resetError?.message || "Password reset failed.");
    }
  }

  return (
    <section className="pharmacy-login-shell" aria-label="Forgot password">
      <article className="pharmacy-login-card">
        <h1>Password Recovery</h1>
        <p className="pharmacy-login-context">
          OTP will be sent to your registered email, mobile number, and WhatsApp.
        </p>

        <form className="pharmacy-login-form" onSubmit={handleSendOtp} noValidate>
          <label htmlFor="forgot-identifier">Registered mobile number or email</label>
          <input
            id="forgot-identifier"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Enter registered mobile or email"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        {otpSent ? (
          <form className="pharmacy-login-form forgot-password-form" onSubmit={handleVerifyOtp} noValidate>
            <label htmlFor="forgot-otp">Enter OTP</label>
            <input
              id="forgot-otp"
              value={otpInput}
              onChange={(event) => setOtpInput(event.target.value)}
              placeholder="6-digit OTP"
            />
            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        ) : null}

        {error ? (
          <div className="pharmacy-login-error-box">
            <p className="pharmacy-login-error">{error}</p>
            {error.includes("No account found") && (
              <Link href="/login" className="pharmacy-inline-btn">
                Create an account
              </Link>
            )}
          </div>
        ) : null}

        {otpVerified ? (
          <form className="pharmacy-login-form forgot-password-form" onSubmit={handleResetPassword} noValidate>
            <label htmlFor="forgot-new-password">New password</label>
            <input
              id="forgot-new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 6 characters"
            />

            <label htmlFor="forgot-confirm-password">Confirm new password</label>
            <input
              id="forgot-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter new password"
            />
            <button type="submit">Reset Password</button>
          </form>
        ) : null}

        {success ? <p className="pharmacy-login-success">{success}</p> : null}

        <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="pharmacy-inline-btn">
          Back to sign in
        </Link>
      </article>
    </section>
  );
}
