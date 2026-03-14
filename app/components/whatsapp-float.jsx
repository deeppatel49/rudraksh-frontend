"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useAuth } from "../context/auth-context";

export function WhatsAppFloat() {
  const { user } = useAuth();
  const phone = "919979979688";
  
  // Build message with useMemo to prevent duplication
  const messageText = useMemo(() => {
    // Only show customer details if user has complete profile data
    if (user && user.fullName && user.address && user.city && user.pincode) {
      const details = [
        "Customer Details:",
        `Name: ${user.fullName}`,
        `Email: ${user.email}`,
        `Address: ${user.address}`,
        `City: ${user.city}`,
        `Pin Code: ${user.pincode}`,
        "",
        "I want more updates about offers and medicine availability.",
      ];
      return details.join("\n");
    }
    
    // Default message for non-logged-in users or incomplete profiles
    return "Hello Rudraksh Pharmacy, I want more updates about offers and medicine availability.";
  }, [user?.id, user?.fullName, user?.email, user?.address, user?.city, user?.pincode]);
  
  const link = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Chat on WhatsApp for updates"
      title="WhatsApp for updates"
    >
      <Image
        src="/whatsapp-circle.svg"
        alt="WhatsApp"
        width={54}
        height={54}
        priority
      />
    </a>
  );
}
