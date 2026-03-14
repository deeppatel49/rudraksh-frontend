"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/auth-context";

const QUICK_ORDER_UPLOAD_KEY = "Rudraksh_quick_order_prescriptions";
const QUICK_ORDER_PREFS_KEY = "Rudraksh_quick_order_preferences";

export function QuickOrderProcessingView() {
  const router = useRouter();
  const { user, getCurrentProfile } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [hasHydratedUploads, setHasHydratedUploads] = useState(false);
  const [processingMode, setProcessingMode] = useState("everything");
  const [callForSelections, setCallForSelections] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(QUICK_ORDER_UPLOAD_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      setUploadedFiles(Array.isArray(parsed?.files) ? parsed.files : []);
    } catch {
      setUploadedFiles([]);
    } finally {
      setHasHydratedUploads(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedUploads) {
      return;
    }

    if (!uploadedFiles.length) {
      router.replace("/quick-order");
    }
  }, [hasHydratedUploads, router, uploadedFiles.length]);

  const profile = useMemo(() => getCurrentProfile?.() || null, [getCurrentProfile]);
  const customerProfile = profile?.customerProfile || {};
  const deliveryCity = customerProfile.city || "Add Address";

  useEffect(() => {
    if (!hasHydratedUploads) {
      return;
    }

    if (!uploadedFiles.length) {
      return;
    }

    window.localStorage.setItem(
      QUICK_ORDER_PREFS_KEY,
      JSON.stringify({
        processingMode,
        callForSelections,
        savedAt: new Date().toISOString(),
      })
    );
      const referenceIds = uploadedFiles.map((f) => f.referenceId).filter(Boolean);
      if (referenceIds.length) {
        fetch("/api/prescriptions/processing", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referenceIds, processingMode, callForSelections }),
        }).catch(() => {});
      }
    }, [callForSelections, hasHydratedUploads, processingMode, uploadedFiles]);

  return (
    <section className="section container quick-order-process-page">
      <div className="quick-process-layout">
        <article className="quick-process-left">
          <div className="quick-process-location">
            <div>
              <p>Delivering to</p>
              <strong>{deliveryCity}</strong>
            </div>
            <Link href="/profile?next=/quick-order/process" className="quick-process-address-link">
              Add Address
            </Link>
          </div>

          <h2>How would you like us to process your request?</h2>

          <label className="quick-process-option">
            <input
              type="radio"
              name="processingMode"
              checked={processingMode === "everything"}
              onChange={() => setProcessingMode("everything")}
            />
            <div>
              <strong>Order everything from the prescription</strong>
              <p>Our pharmacist will arrange medicines as per your uploaded prescription(s).</p>
            </div>
          </label>

          <label className="quick-process-option">
            <input
              type="radio"
              name="processingMode"
              checked={processingMode === "call"}
              onChange={() => setProcessingMode("call")}
            />
            <div>
              <strong>Request pharmacist to call</strong>
              <p>Our pharmacist will call and confirm medicines with you before placing order.</p>
            </div>
          </label>

          <div className="quick-process-info">
            <p>We will take about</p>
            <strong>4 minutes to process your request</strong>
          </div>

          <div className="quick-process-tasks">
            <p>Your assigned pharmacist will make the following selections:</p>
            <ul>
              <li>Add medicines</li>
              <li>Apply best coupon</li>
              <li>Choose earliest delivery date</li>
              <li>Place the order for you</li>
            </ul>
          </div>

          <label className="quick-process-toggle">
            <span>Call me for above selections</span>
            <input
              type="checkbox"
              checked={callForSelections}
              onChange={(event) => setCallForSelections(event.target.checked)}
            />
          </label>

          {!user ? (
            <p className="quick-process-note">
              You are not logged in. <Link href="/login?next=/quick-order/process">Login</Link> for
              saved address and faster confirmation.
            </p>
          ) : null}
        </article>

        <aside className="quick-process-right">
          <h3>{uploadedFiles.length} prescription attached</h3>

          <ul className="quick-process-files">
            {uploadedFiles.map((file) => (
              <li key={file.referenceId || file.fileName}>
                <div>
                  <strong>{file.fileName}</strong>
                  <p>{file.referenceId}</p>
                </div>
                {file.fileUrl ? (
                  <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
