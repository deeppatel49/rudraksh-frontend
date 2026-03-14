"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/auth-context";

function buildFormData(user, profile) {
  const savedProfile = profile?.customerProfile || {};
  return {
    fullName: savedProfile.fullName || user?.name || "",
    gender: savedProfile.gender || "",
    mobileNumber: savedProfile.mobileNumber || user?.phone || "",
    email: savedProfile.email || user?.email || "",
    address: savedProfile.address || "",
    city: savedProfile.city || "",
    pincode: savedProfile.pincode || "",
  };
}

function sanitizeNextPath(value) {
  const safePath = String(value || "").trim();
  if (!safePath.startsWith("/")) {
    return "/profile";
  }

  if (safePath === "/profile/setup") {
    return "/profile";
  }

  return safePath;
}

export function ProfileSetupView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isHydrated, getCurrentProfile, hasCompletedProfile, updateCustomerProfile } = useAuth();
  const currentProfile = useMemo(() => getCurrentProfile?.() || null, [getCurrentProfile]);
  const [formData, setFormData] = useState(() => buildFormData(user, currentProfile));
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const nextPath = useMemo(() => sanitizeNextPath(searchParams?.get("next")), [searchParams]);

  useEffect(() => {
    setFormData(buildFormData(user, currentProfile));
  }, [currentProfile, user]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!user) {
      router.replace("/login?next=/profile/setup");
    }
  }, [isHydrated, router, user]);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateForm() {
    const requiredFields = ["fullName", "gender", "mobileNumber", "email", "address", "city", "pincode"];
    for (const field of requiredFields) {
      if (!String(formData[field] || "").trim()) {
        return "Please fill all required fields.";
      }
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      await updateCustomerProfile({
        ...formData,
        whatsappNumber: formData.mobileNumber,
      });
      setSuccessMessage("Profile saved successfully.");
      router.replace(nextPath);
    } catch (error) {
      setErrorMessage(error?.message || "Unable to save profile.");
    }
  }

  if (!isHydrated || !user) {
    return null;
  }

  const isCompleted = hasCompletedProfile();

  return (
    <section className="section section-soft">
      <div className="container">
        <div className="profile-setup-shell">
          <form className="profile-edit-card" onSubmit={handleSubmit} noValidate>
            <h3>{isCompleted ? "Edit Profile" : "Complete Your Profile"}</h3>

            <label>
              Full Name
              <input name="fullName" value={formData.fullName} onChange={handleFieldChange} required />
            </label>

            <label>
              Gender
              <select name="gender" value={formData.gender} onChange={handleFieldChange} required>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Mobile Number
              <input name="mobileNumber" value={formData.mobileNumber} onChange={handleFieldChange} required />
            </label>

            <label>
              Email Address
              <input name="email" type="email" value={formData.email} onChange={handleFieldChange} required />
            </label>

            <label>
              Complete Address
              <textarea name="address" rows={3} value={formData.address} onChange={handleFieldChange} required />
            </label>

            <label>
              City
              <input name="city" value={formData.city} onChange={handleFieldChange} required />
            </label>

            <label>
              Pincode
              <input name="pincode" value={formData.pincode} onChange={handleFieldChange} required />
            </label>

            <button type="submit" className="primary-btn">Save Changes</button>
            {errorMessage ? <p className="profile-form-message error">{errorMessage}</p> : null}
            {successMessage ? <p className="profile-form-message success">{successMessage}</p> : null}
          </form>
        </div>
      </div>
    </section>
  );
}
