"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { createBackendAssetUrl } from "../lib/backend-api";
import { isOrderDelivered, readOrdersForUser } from "../lib/order-client";
import {
  createOrUpdateMessageStatus,
  fetchMessageStatuses,
} from "../lib/services/message-status-service";

const BACKEND_ORIGIN = String(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000")
  .trim()
  .replace(/\/api\/v1\/?$/i, "")
  .replace(/\/+$/, "");

function resolveChatAttachmentUrl(pathname) {
  const path = String(pathname || "").trim();
  if (!path) {
    return { primary: "", fallback: "" };
  }

  if (/^https?:\/\//i.test(path)) {
    return { primary: encodeURI(path), fallback: "" };
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const fallback = createBackendAssetUrl(normalized);

  if (normalized.startsWith("/uploads/")) {
    const primary = encodeURI(`${BACKEND_ORIGIN}${normalized}`);
    const encodedFallback = encodeURI(fallback);
    return {
      primary,
      fallback: primary !== encodedFallback ? encodedFallback : "",
    };
  }

  return {
    primary: encodeURI(fallback),
    fallback: "",
  };
}

function formatOrderDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function buildFormData(user, profile) {
  const savedProfile = profile?.customerProfile || {};
  return {
    fullName: savedProfile.fullName || user.name || "",
    gender: savedProfile.gender || "",
    mobileNumber: savedProfile.mobileNumber || user.phone || "",
    email: savedProfile.email || user.email || "",
    address: savedProfile.address || "",
    city: savedProfile.city || "",
    pincode: savedProfile.pincode || "",
  };
}

function getInitials(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return "CU";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] || ""}${words[1][0] || ""}`.toUpperCase();
}

function formatMemberSince(dateString) {
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Member since recently";
  }

  return `Member since ${new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(parsedDate)}`;
}

function buildCustomerChatQuery(user, markAsRead = false) {
  const query = new URLSearchParams();

  if (user.id) query.set("userId", user.id);
  if (user.email) query.set("email", user.email);
  if (user.phone) query.set("phone", user.phone);
  if (markAsRead) query.set("markAsRead", "true");

  return query.toString();
}

function renderOrder(order, isRecent = false) {
  const delivered = isOrderDelivered(order);

  return (
    <article key={order.id} className={`profile-order-card${isRecent ? " recent" : ""}`}>
      {isRecent ? <p className="profile-order-kicker">Most Recent Order</p> : null}
      {isRecent ? <h3>{order.id}</h3> : <h4>{order.id}</h4>}
      <p>{formatOrderDate(order.createdAt)}</p>
      <p>Total: Rs {order.totalAmount}</p>
      <p>Items: {order.itemCount}</p>
      <p className={`order-status ${delivered ? "ok" : "pending"}`}>
        Delivery Status: {delivered ? "Delivered" : "Processing"}
      </p>
    </article>
  );
}

function ProfileDetails({ user, getCurrentProfile, logout }) {
  const router = useRouter();
  const profileSnapshot = useMemo(() => getCurrentProfile(), [getCurrentProfile]);
  const [formData, setFormData] = useState(() => buildFormData(user, profileSnapshot));
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatError, setChatError] = useState("");
  const [chatDraft, setChatDraft] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const orders = useMemo(() => readOrdersForUser(user.id), [user.id]);
  const customerChatQuery = useMemo(() => buildCustomerChatQuery(user, true), [user]);

  useEffect(() => {
    setFormData(buildFormData(user, profileSnapshot));
  }, [profileSnapshot, user]);

  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      try {
        const response = await fetch(`/api/customer-chat?${customerChatQuery}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to load seller messages.");
        }

        const rawMessages = Array.isArray(payload?.messages) ? payload.messages : [];
        const ids = rawMessages
          .map((item) => String(item?.id || "").trim())
          .filter(Boolean);

        const statusMap = ids.length ? await fetchMessageStatuses(ids) : {};
        const mergedMessages = rawMessages.map((item) => {
          const itemId = String(item?.id || "").trim();
          const resolvedStatus = itemId ? statusMap[itemId] : "";

          return {
            ...item,
            status: resolvedStatus || item.status || "not-read",
          };
        });

        const upsertItems = mergedMessages
          .map((item) => {
            const messageId = String(item?.id || "").trim();
            if (!messageId) {
              return null;
            }

            return {
              messageId,
              status: item.status,
              source: "customer_chat",
              updatedBy: user.id,
              metadata: {
                senderRole: item.senderRole || "",
              },
            };
          })
          .filter(Boolean);

        if (upsertItems.length) {
          void createOrUpdateMessageStatus({ items: upsertItems }).catch(() => {});
        }

        if (isMounted) {
          setChatMessages(mergedMessages);
          setChatError("");
        }
      } catch (error) {
        if (isMounted) {
          setChatError(error?.message || "Unable to load seller messages.");
        }
      } finally {
        if (isMounted) {
          setChatLoading(false);
        }
      }
    }

    void loadMessages();
    const intervalId = window.setInterval(loadMessages, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [customerChatQuery, user.id]);

  const displayName = formData.fullName || user.name || "Customer";
  const contactEmail = formData.email || user.email || "Not added";
  const contactGender = formData.gender || "Not added";
  const contactMobile = formData.mobileNumber || user.phone || "Not added";
  const contactAddress = formData.address || "Not added";
  const contactCity = formData.city || "Not added";
  const contactPincode = formData.pincode || "Not added";
  const memberDate = orders[0]?.createdAt || new Date().toISOString();

  async function handleChatSubmit(event) {
    event.preventDefault();

    const message = chatDraft.trim();
    if (!message) {
      setChatError("Message is required.");
      return;
    }

    setChatSending(true);

    try {
      const response = await fetch("/api/customer-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          phone: user.phone,
          name: displayName,
          senderRole: "customer",
          senderName: displayName,
          message,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to send message.");
      }

      if (payload?.item?.id) {
        void createOrUpdateMessageStatus({
          messageId: payload.item.id,
          status: "not-read",
          source: "customer_chat",
          updatedBy: user.id,
          metadata: {
            senderRole: "customer",
          },
        }).catch(() => {});
      }

      setChatMessages((current) => [...current, payload.item].sort(
        (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      ));
      setChatDraft("");
      setChatError("");
    } catch (error) {
      setChatError(error?.message || "Unable to send message.");
    } finally {
      setChatSending(false);
    }
  }

  return (
    <section className="section section-soft customer-profile-page">
      <div className="container profile-layout-modern profile-layout-profile-only">
        <aside className="profile-side-column">
          <article className="profile-identity-card">
            <div className="profile-avatar-circle">{getInitials(displayName)}</div>
            <h2>{displayName}</h2>
            <p>{formatMemberSince(memberDate)}</p>

            <div className="profile-identity-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => router.push("/profile/setup?next=/profile")}
              >
                Edit Profile
              </button>
              <button type="button" className="secondary-btn danger-outline" onClick={logout}>
                Log Out
              </button>
            </div>
            </article>
          <article className="profile-contact-card">
            <h3>Contact Information</h3>
            <ul>
              <li>
                <span>Name</span>
                <strong>{displayName}</strong>
              </li>
              <li>
                <span>Email</span>
                <strong>{contactEmail}</strong>
              </li>
              <li>
                <span>Gender</span>
                <strong>{contactGender}</strong>
              </li>
              <li>
                <span>Phone</span>
                <strong>{contactMobile}</strong>
              </li>
              <li>
                <span>Address</span>
                <strong>{contactAddress}</strong>
              </li>
              <li>
                <span>City</span>
                <strong>{contactCity}</strong>
              </li>
              <li>
                <span>Pincode</span>
                <strong>{contactPincode}</strong>
              </li>
            </ul>
          </article>

          <article className="profile-contact-card profile-chat-card">
            <div className="profile-chat-head">
              <div>
                <h3>Seller Chat Box</h3>
                <p>Updates from the seller about payments, orders, and support.</p>
              </div>
            </div>

            {chatLoading ? <p className="profile-chat-empty">Loading messages...</p> : null}
            {chatError ? <p className="profile-chat-error">{chatError}</p> : null}

            {!chatLoading && !chatError ? (
              chatMessages.length ? (
                <div className="profile-chat-thread">
                  {chatMessages.map((item) => (
                    <article
                      key={item.id || `${item.senderRole}-${item.createdAt}`}
                      className={`profile-chat-bubble ${item.senderRole === "seller" ? "seller" : "user"}`}
                    >
                      {(() => {
                        const attachmentUrls = item.attachment?.url
                          ? resolveChatAttachmentUrl(item.attachment.url)
                          : { primary: "", fallback: "" };
                        return (
                          <>
                      <strong>{item.senderName || (item.senderRole === "seller" ? "Seller" : displayName)}</strong>
                      {item.message ? <p>{item.message}</p> : null}
                      {item.attachment?.url ? (
                        <div className="profile-chat-attachment">
                          {String(item.attachment.mimeType || "").startsWith("image/") ? (
                            <a
                              href={attachmentUrls.primary}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={attachmentUrls.primary}
                                data-fallback-src={attachmentUrls.fallback}
                                alt={item.attachment.fileName || "Chat attachment"}
                                onError={(event) => {
                                  const target = event.currentTarget;
                                  if (target.dataset.fallbackApplied === "true") {
                                    return;
                                  }

                                  const fallbackSrc = target.dataset.fallbackSrc || "";
                                  if (fallbackSrc && target.src !== fallbackSrc) {
                                    target.dataset.fallbackApplied = "true";
                                    target.src = fallbackSrc;
                                  }
                                }}
                              />
                            </a>
                          ) : String(item.attachment.mimeType || "").startsWith("video/") ? (
                            <video controls preload="metadata" width={260}>
                              <source src={attachmentUrls.primary} type={item.attachment.mimeType || "video/mp4"} />
                              {attachmentUrls.fallback ? (
                                <source src={attachmentUrls.fallback} type={item.attachment.mimeType || "video/mp4"} />
                              ) : null}
                              Your browser does not support the video tag.
                            </video>
                          ) : null}
                          <a
                            href={attachmentUrls.primary}
                            className="profile-chat-attachment-link"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {item.attachment.fileName || "Open attachment"}
                          </a>
                        </div>
                      ) : null}
                      <span>{formatOrderDate(item.createdAt)}</span>
                          </>
                        );
                      })()}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="profile-chat-empty">No seller messages yet.</p>
              )
            ) : null}

            <form className="profile-chat-form" onSubmit={handleChatSubmit}>
              <label htmlFor="customer-chat-message">Reply to seller</label>
              <textarea
                id="customer-chat-message"
                value={chatDraft}
                onChange={(event) => setChatDraft(event.target.value)}
                rows={4}
                placeholder="Ask about your order, payment, or delivery status."
              />
              <button type="submit" className="secondary-btn" disabled={chatSending}>
                {chatSending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </article>
        </aside>
      </div>
    </section>
  );
}

function OrdersContent({ user }) {
  const [orders] = useState(() => readOrdersForUser(user.id));
  const mostRecentOrder = orders[0] || null;
  const previousOrders = orders.slice(1);

  return (
    <section className="section section-soft customer-profile-page">
      <div className="container">
        <section className="profile-orders-wrap" aria-label="Customer orders">
          <div className="profile-previous-orders">
            <h2>Recent Order Information</h2>
            {mostRecentOrder ? (
              renderOrder(mostRecentOrder, true)
            ) : (
              <article className="profile-order-card">
                <p>No recent order found.</p>
              </article>
            )}
          </div>

          <div className="profile-previous-orders">
            <h3>Previous Order Information</h3>
            {previousOrders.length ? (
              <div className="profile-order-grid">
                {previousOrders.map((order) => renderOrder(order))}
              </div>
            ) : (
              <article className="profile-order-card">
                <p>No previous orders available.</p>
              </article>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function useProtectedCustomerRoute(nextPath) {
  const router = useRouter();
  const { user, isHydrated, getCurrentProfile, hasCompletedProfile, logout } = useAuth();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!user) {
      router.replace(`/login?next=${nextPath}`);
      return;
    }

    if (!hasCompletedProfile()) {
      router.replace(`/profile/setup?next=${nextPath}`);
    }
  }, [hasCompletedProfile, isHydrated, nextPath, router, user]);

  return { user, isHydrated, getCurrentProfile, logout };
}

export function CustomerProfileView() {
  const { user, isHydrated, getCurrentProfile, logout } = useProtectedCustomerRoute("/profile");

  if (!isHydrated || !user) {
    return null;
  }

  return (
    <ProfileDetails
      key={user.id}
      user={user}
      getCurrentProfile={getCurrentProfile}
      logout={logout}
    />
  );
}

export function CustomerOrdersView() {
  const { user, isHydrated } = useProtectedCustomerRoute("/orders");

  if (!isHydrated || !user) {
    return null;
  }

  return <OrdersContent key={user.id} user={user} />;
}
