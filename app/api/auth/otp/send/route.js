

import { NextResponse } from "next/server";
import { createOtpChallenge } from "../../../../lib/otp-store";
import nodemailer from "nodemailer";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim().toLowerCase());
}

function parseEmailList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean);
  }

  return String(value || "")
    .split(/[,\s;]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values)];
}

let transporter;

function getMissingSmtpConfig() {
  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
  return required.filter((key) => !String(process.env[key] || "").trim());
}

function hasPlaceholderSmtpConfig() {
  const smtpUser = String(process.env.SMTP_USER || "").trim().toLowerCase();
  const smtpPass = String(process.env.SMTP_PASS || "").trim().toLowerCase();
  const mailFrom = String(process.env.MAIL_FROM || "").trim().toLowerCase();

  const placeholderTokens = [
    "your_email",
    "your_app_password",
    "your_16_char",
    "paste_16_char_gmail_app_password",
    "example.com",
  ];

  const containsPlaceholder = (value) =>
    placeholderTokens.some((token) => value.includes(token));

  return containsPlaceholder(smtpUser) || containsPlaceholder(smtpPass) || containsPlaceholder(mailFrom);
}

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const missing = getMissingSmtpConfig();
  if (missing.length) {
    throw new Error(`SMTP config missing: ${missing.join(", ")}`);
  }
  if (hasPlaceholderSmtpConfig()) {
    throw new Error(
      "SMTP config contains placeholder values. Replace SMTP_USER, SMTP_PASS and MAIL_FROM with real credentials."
    );
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const rawPass = String(process.env.SMTP_PASS || "");
  // Gmail app passwords are shown in groups with spaces; normalize them.
  const pass = host === "smtp.gmail.com" ? rawPass.replace(/\s+/g, "") : rawPass;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const ignoreTlsErrors = String(process.env.SMTP_IGNORE_TLS_ERRORS || "").trim().toLowerCase();
  const allowInsecureTls =
    ignoreTlsErrors === "1" ||
    ignoreTlsErrors === "true" ||
    ignoreTlsErrors === "yes" ||
    ignoreTlsErrors === "on";

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    ...(allowInsecureTls
      ? {
          tls: {
            rejectUnauthorized: false,
          },
        }
      : {}),
  });

  return transporter;
}

async function sendEmailOtp({ emails, otp }) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new Error("Sender missing: MAIL_FROM or SMTP_USER is required");
  }

  const mailTransporter = getTransporter();

  await mailTransporter.sendMail({
    from,
    to: emails.join(", "),
    subject: "Rudraksh Pharmacy - Your OTP for Password Reset",
    text: `Your OTP is ${otp}. It is valid for 5 minutes. Do not share this OTP with anyone.`,
    html: `
      <div style="font-family:Segoe UI,Tahoma,Verdana,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f8f9fa;border-radius:8px">
        <div style="background:linear-gradient(135deg,#2978d6 0%,#174a8e 100%);color:#fff;padding:24px;border-radius:8px 8px 0 0;text-align:center">
          <h2 style="margin:0">Rudraksh Pharmacy</h2>
          <p style="margin:8px 0 0;font-size:14px">Password Reset OTP</p>
        </div>
        <div style="background:#fff;padding:24px;border-radius:0 0 8px 8px">
          <p>Your OTP code is:</p>
          <div style="font-size:34px;font-weight:700;letter-spacing:2px;color:#174a8e;text-align:center;padding:14px;border:2px dashed #2978d6;border-radius:8px;background:#eef6ff">${otp}</div>
          <p style="margin-top:14px;font-size:13px;color:#666">Valid for 5 minutes. Do not share this OTP with anyone.</p>
        </div>
      </div>
    `,
  });
}

async function sendEmailOtpToRecipient({ email, otp }) {
  await sendEmailOtp({ emails: [email], otp });
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const identifier = String(payload?.identifier || "").trim();
  const recipients = unique(parseEmailList(payload?.emails || payload?.email));

  if (!identifier) {
    return NextResponse.json({ error: "Identifier is required." }, { status: 400 });
  }

  if (!recipients.length) {
    return NextResponse.json(
      { error: "At least one valid email is required to receive OTP." },
      { status: 400 }
    );
  }

  const invalidEmails = recipients.filter((email) => !isValidEmail(email));
  if (invalidEmails.length) {
    return NextResponse.json(
      { error: `Invalid email(s): ${invalidEmails.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    if (recipients.length === 1) {
      // Keep existing flow: OTP is tied to submitted identifier (email or phone).
      const { otp } = createOtpChallenge({ identifier });
      await sendEmailOtpToRecipient({ email: recipients[0], otp });
    } else {
      // Multi-user flow: each recipient gets a different OTP tied to their own email.
      const results = await Promise.allSettled(
        recipients.map(async (email) => {
          const { otp } = createOtpChallenge({ identifier: email });
          await sendEmailOtpToRecipient({ email, otp });
          return email;
        })
      );

      const delivered = [];
      const failed = [];
      results.forEach((item, index) => {
        if (item.status === "fulfilled") {
          delivered.push(item.value);
        } else {
          failed.push({
            email: recipients[index],
            reason: String(item.reason?.message || "Delivery failed"),
          });
        }
      });

      if (!delivered.length) {
        throw new Error(`Failed to send OTP to all recipients. ${failed.map((f) => `${f.email}: ${f.reason}`).join(" | ")}`);
      }

      return NextResponse.json({
        success: true,
        message: `OTP sent successfully to ${delivered.length} email(s). Each email has its own OTP.`,
        sentTo: delivered,
        ...(failed.length
          ? {
              deliveryWarnings: failed.map((item) => `${item.email}: ${item.reason}`),
            }
          : {}),
      });
    }
  } catch (error) {
    const raw = String(error?.message || "").trim();
    const isGmail = String(process.env.SMTP_HOST || "").trim().toLowerCase() === "smtp.gmail.com";
    const allowDevFallback =
      String(process.env.ENABLE_DEV_OTP_FALLBACK || "").trim().toLowerCase() === "true";
    const gmailHint = isGmail
      ? " For Gmail, enable 2-Step Verification and use a 16-character App Password (not your normal Gmail password)."
      : "";
    const detailedError =
      process.env.NODE_ENV === "production" || !raw
        ? "Email OTP delivery failed."
        : `Email OTP delivery failed: ${raw}`;

    if (process.env.NODE_ENV !== "production" && allowDevFallback) {
      return NextResponse.json({
        success: true,
        message: "OTP generated for development, but email delivery failed.",
        deliveryWarnings: [
          `${detailedError} Check .env.local SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM and restart server.${gmailHint}`,
        ],
      });
    }

    return NextResponse.json(
      {
        error: `${detailedError} Check .env.local SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM and restart server.${gmailHint}`,
        ...(raw ? { deliveryWarnings: [raw] } : {}),
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `OTP sent successfully to ${recipients.length} email(s).`,
  });
}
