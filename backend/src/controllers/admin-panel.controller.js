/**
 * Admin panel page rendering controller
 */

import { getAdminFromToken } from "../services/auth.service.js";
import { env } from "../config/env.js";
import { fetchDashboardSummary } from "../services/dashboard.service.js";
import { fetchProductById, fetchProducts, saveProductChanges } from "../services/products.service.js";
import { fetchOrders } from "../services/orders.service.js";
import {
  fetchAboutContent,
  fetchHomeContent,
  saveAboutContent,
  saveHomeContent,
} from "../services/content.service.js";
import { fetchOwnProfile, updateOwnProfile } from "../services/profile.service.js";
import { listRecentReviews } from "../repositories/reviews.repository.js";
import { listContactSubmissions } from "../repositories/contact.repository.js";
import { getMessageStatuses, setMessageStatus } from "../repositories/message-status.repository.js";
import { listPrescriptionRecords } from "../repositories/prescription.repository.js";
import {
  appendCustomerChatMessage,
  readCustomerChatMessages,
  deleteCustomerChatMessage,
} from "../repositories/customer-chat.repository.js";
import { readLoginActivities, readCustomerProfiles } from "../repositories/customer-auth.repository.js";
import { publishCustomerChatEvent } from "../services/customer-chat-events.js";

function normalizeMultilineText(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toAbsolutePrescriptionUrl(fileUrl) {
  const safeUrl = String(fileUrl || "").trim();
  if (!safeUrl) {
    return "#";
  }

  if (/^https?:\/\//i.test(safeUrl)) {
    return safeUrl;
  }

  const baseUrl = String(env.frontendUrl || "http://localhost:3000").replace(/\/+$/, "");
  return `${baseUrl}${safeUrl.startsWith("/") ? safeUrl : `/${safeUrl}`}`;
}

function buildHomePayload(body) {
  return {
    hero: {
      kicker: String(body.heroKicker || "").trim(),
      title: String(body.heroTitle || "").trim(),
      description: String(body.heroDescription || "").trim(),
      mediaUrl: String(body.heroMediaUrl || "").trim(),
      mediaType: String(body.heroMediaType || "").trim(),
      mediaMimeType: String(body.heroMediaMimeType || "").trim(),
      primaryCtaLabel: String(body.heroPrimaryCtaLabel || "").trim(),
      primaryCtaHref: String(body.heroPrimaryCtaHref || "").trim(),
      secondaryCtaLabel: String(body.heroSecondaryCtaLabel || "").trim(),
      secondaryCtaHref: String(body.heroSecondaryCtaHref || "").trim(),
    },
    heroStats: [1, 2, 3].map((index) => ({
      value: String(body[`heroStatValue${index}`] || "").trim(),
      label: String(body[`heroStatLabel${index}`] || "").trim(),
    })).filter((item) => item.value && item.label),
    trustPillars: [1, 2, 3].map((index) => ({
      title: String(body[`pillarTitle${index}`] || "").trim(),
      description: String(body[`pillarDescription${index}`] || "").trim(),
    })).filter((item) => item.title && item.description),
    promoBanner: {
      kicker: String(body.promoKicker || "").trim(),
      offerHighlight: String(body.promoOfferHighlight || "").trim(),
      title: String(body.promoTitle || "").trim(),
      description: String(body.promoDescription || "").trim(),
      mediaUrl: String(body.promoMediaUrl || "").trim(),
      mediaType: String(body.promoMediaType || "").trim(),
      mediaMimeType: String(body.promoMediaMimeType || "").trim(),
      primaryCtaLabel: String(body.promoPrimaryCtaLabel || "").trim(),
      primaryCtaHref: String(body.promoPrimaryCtaHref || "").trim(),
      secondaryCtaLabel: String(body.promoSecondaryCtaLabel || "").trim(),
      secondaryCtaHref: String(body.promoSecondaryCtaHref || "").trim(),
      metaTitle: String(body.promoMetaTitle || "").trim(),
      metaSubtitle: String(body.promoMetaSubtitle || "").trim(),
    },
    seo: {
      title: String(body.homeSeoTitle || "").trim(),
      description: String(body.homeSeoDescription || "").trim(),
    },
  };
}

function toUploadedAsset(file) {
  if (!file) {
    return null;
  }

  const folderName = String(file.destination || "").split(/[\\/]/).pop() || "general";
  const mimeType = String(file.mimetype || "").toLowerCase();
  const extension = String(file.originalname || "").toLowerCase();
  const isVideo =
    mimeType.startsWith("video/") ||
    extension.endsWith(".mp4") ||
    extension.endsWith(".webm") ||
    extension.endsWith(".ogg") ||
    extension.endsWith(".mov") ||
    extension.endsWith(".avi") ||
    extension.endsWith(".mkv");

  return {
    mediaUrl: `/uploads/${folderName}/${file.filename}`,
    mediaType: isVideo ? "video" : "image",
    mediaMimeType: String(file.mimetype || "").trim(),
  };
}

function getUploadedFile(req, fieldName) {
  if (!Array.isArray(req.files)) {
    return null;
  }

  return req.files.find((file) => file.fieldname === fieldName) || null;
}

function buildAboutPayload(body) {
  return {
    trustStats: [1, 2, 3, 4].map((index) => ({
      value: String(body[`aboutStatValue${index}`] || "").trim(),
      label: String(body[`aboutStatLabel${index}`] || "").trim(),
    })).filter((item) => item.value && item.label),
    highlights: normalizeMultilineText(body.aboutHighlights),
    storyImage: {
      mediaUrl: String(body.aboutStoryImageUrl || "").trim(),
      mediaType: String(body.aboutStoryImageType || "").trim(),
      mediaMimeType: String(body.aboutStoryImageMimeType || "").trim(),
      alt: String(body.aboutStoryImageAlt || "").trim(),
    },
    seo: {
      title: String(body.aboutSeoTitle || "").trim(),
      description: String(body.aboutSeoDescription || "").trim(),
    },
  };
}

async function loadAdminPanelContext(adminToken, options = {}) {
  const adminUser = await getAdminFromToken(adminToken);
  if (!adminUser) {
    return { adminUser: null, dashboardData: null, homeContent: null, aboutContent: null };
  }

  const includeContent = options.includeContent === true;
  const [dashboardData, homeContent, aboutContent] = await Promise.all([
    fetchDashboardSummary(),
    includeContent ? fetchHomeContent() : Promise.resolve(null),
    includeContent ? fetchAboutContent() : Promise.resolve(null),
  ]);

  return { adminUser, dashboardData, homeContent, aboutContent };
}

async function loadSectionViewModel(section, filters = {}, adminUser = null) {
  if (section === "products") {
    const requestedPage = Math.max(1, Number(filters.page) || 1);
    const requestedLimit = Math.max(10, Math.min(250, Number(filters.limit) || 100));
    const searchQuery = String(filters.q || filters.query || "").trim();
    const editProductId = String(filters.edit || "").trim();
    const createProductsParams = (overrides = {}) => {
      const params = new URLSearchParams();
      const nextPage = overrides.page || requestedPage;
      const nextLimit = overrides.limit || requestedLimit;
      const nextQuery = Object.prototype.hasOwnProperty.call(overrides, "q") ? overrides.q : searchQuery;
      const nextEdit = Object.prototype.hasOwnProperty.call(overrides, "edit") ? overrides.edit : editProductId;

      params.set("page", String(nextPage));
      params.set("limit", String(nextLimit));

      if (nextQuery) {
        params.set("q", nextQuery);
      }

      if (nextEdit) {
        params.set("edit", nextEdit);
      }

      return params;
    };

    const result = await fetchProducts({
      page: requestedPage,
      limit: requestedLimit,
      query: searchQuery,
      includeTotal: true,
    });
    const pagination = result.pagination || {};
    const total = Number(pagination.total) || 0;
    const totalPages = Math.max(1, Number(pagination.totalPages) || 1);
    const currentPage = Math.max(1, Math.min(requestedPage, totalPages));
    const offset = (currentPage - 1) * requestedLimit;
    const buildProductsHref = (page, extra = {}) => {
      const params = createProductsParams({ ...extra, page });
      return `${env.backendUrl}/admin/section/products?${params.toString()}`;
    };
    const selectedProduct = editProductId ? await fetchProductById(editProductId) : null;

    return {
      title: "Products",
      description: searchQuery
        ? `Search results for \"${searchQuery}\". Showing ${result.products.length} records on page ${currentPage} of ${totalPages}.`
        : `Browse the Supabase catalog in pages. Showing ${result.products.length} records on page ${currentPage} of ${totalPages}.`,
      tableTitle: "Products Inventory",
      columns: ["SrNo", "Item Name", "Company", "Generic", "ItemType", "Category", "Pack", "MRP", "Actions"],
      rows: result.products.map((product, index) => ([
        product.srNo || offset + index + 1,
        product.name || "Untitled product",
        product.manufacturer || "N/A",
        product.composition || "N/A",
        product.drug_type || "N/A",
        product.category || "Medicine",
        product.pack_size || "N/A",
        `Rs. ${Number(product.price || 0).toFixed(2)}`,
        {
          type: "link",
          label: selectedProduct?.id === product.id ? "Editing" : "Edit",
          href: buildProductsHref(currentPage, { edit: String(product.id || product.srNo || "") }),
          variant: selectedProduct?.id === product.id ? "secondary" : "primary",
        },
      ])),
      emptyMessage: "No products are available yet.",
      search: {
        query: searchQuery,
        action: `${env.backendUrl}/admin/section/products`,
      },
      productEditor: selectedProduct ? {
        action: `${env.backendUrl}/admin/products/update`,
        cancelHref: `${env.backendUrl}/admin/section/products?${createProductsParams({ edit: "" }).toString()}`,
        page: currentPage,
        limit: requestedLimit,
        query: searchQuery,
        product: selectedProduct,
      } : null,
      pagination: {
        total,
        currentPage,
        totalPages,
        limit: requestedLimit,
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        previousHref: currentPage > 1 ? buildProductsHref(currentPage - 1) : null,
        nextHref: currentPage < totalPages ? buildProductsHref(currentPage + 1) : null,
      },
    };
  }

  if (section === "login-data") {
    const activities = await readLoginActivities();

    return {
      title: "Login Data",
      description: "Every successful manual and Google login is recorded here for backend review.",
      tableTitle: "Login Data Management",
      columns: ["#", "Method", "Name", "Email", "Phone", "Address", "City", "Pincode", "Identifier", "IP", "Time"],
      rows: activities.map((activity, index) => ([
        index + 1,
        activity.loginMethod === "google" ? "Google" : "Manual",
        {
          type: "inline-link",
          label: activity.name || "Customer",
          href: `${env.backendUrl}/admin/customer-chat?userId=${encodeURIComponent(activity.userId || "")}&email=${encodeURIComponent(activity.email || "")}&phone=${encodeURIComponent(activity.phone || "")}&name=${encodeURIComponent(activity.name || "")}`,
        },
        activity.email || "Not added",
        activity.phone || "Not added",
        activity.address || "Not added",
        activity.city || "Not added",
        activity.pincode || "Not added",
        activity.identifier || "Not added",
        activity.ipAddress || "Unavailable",
        activity.loggedInAt ? new Date(activity.loggedInAt).toLocaleString("en-IN") : "N/A",
      ])),
      emptyMessage: "No login data available yet.",
    };
  }

  if (section === "reviews") {
    const reviewerFilter = String(filters.reviewer || "").trim().toLowerCase();
    const allRows = await listRecentReviews(200);
    const rows = reviewerFilter
      ? allRows.filter((review) =>
          String(review.reviewer_name || "").trim().toLowerCase() === reviewerFilter
        )
      : allRows.slice(0, 20);

    return {
      title: "Reviews",
      description: reviewerFilter
        ? `Showing review records for ${String(filters.reviewer || "").trim()}.`
        : "Latest customer reviews collected from product and homepage forms.",
      tableTitle: reviewerFilter ? "Customer Review Status" : "Recent Reviews",
      columns: ["Reviewer", "Product", "Rating", "Date", "Message"],
      rows: rows.map((review) => ([
        review.reviewer_name || "Anonymous",
        review.product_id || "Unknown product",
        String(review.rating || 0),
        review.created_at ? new Date(review.created_at).toLocaleDateString("en-IN") : "N/A",
        review.description || "",
      ])),
      emptyMessage: "No reviews have been submitted yet.",
    };
  }

  if (section === "messages") {
    const entries = await listContactSubmissions(20);
    const statusMap = await getMessageStatuses(entries.map((entry) => entry.id));

    return {
      title: "Messages",
      description: "Latest inquiries submitted from the frontend contact form.",
      tableTitle: "Recent Messages",
      columns: ["Name", "Email", "Phone", "Date", "Message", "Status"],
      rows: entries.map((entry) => ([
        entry.name || "N/A",
        entry.email || "N/A",
        entry.phone || "N/A",
        entry.created_at ? new Date(entry.created_at).toLocaleDateString("en-IN") : "N/A",
        entry.message || "",
        {
          type: "status-select",
          key: entry.id,
          value: statusMap[String(entry.id || "").trim()] === "read" ? "read" : "not-read",
          action: `${env.backendUrl}/admin/messages/status`,
        },
      ])),
      emptyMessage: "No contact messages have been submitted yet.",
    };
  }

  if (section === "orders") {
    const ordersData = await fetchOrders({ limit: 100, offset: 0 });
    const orderRows = ordersData.orders.map((order) => [
      order.deliveryStatus,
      `Order ${order.id}`,
      `${order.itemCount} item${order.itemCount !== 1 ? "s" : ""}`,
      `₹${order.totalAmount.toFixed(2)}`,
      new Date(order.createdAt).toLocaleDateString("en-IN"),
      {
        type: "link",
        label: "View",
        href: `${resolvedAdminBaseUrl}/admin/order/${order.id}`,
        variant: "secondary",
      },
    ]);

    return {
      title: "Orders",
      description: "Recent orders placed by customers. Manage delivery status and view order details.",
      tableTitle: `Recent Orders (${ordersData.pagination.total} total)`,
      columns: ["Status", "Order ID", "Items", "Total", "Date", "Action"],
      rows: orderRows,
      emptyMessage: "No orders yet. Orders will appear here when customers place purchases.",
    };
  }

  if (section === "prescriptions") {
    const rows = await listPrescriptionRecords(100);
    return {
      title: "Prescriptions",
      description: "Uploaded prescriptions from the frontend quick-order flow. These records are stored independently from orders.",
      tableTitle: "Recent Prescriptions",
      columns: ["Reference", "Customer", "Mobile", "Preview", "File", "Uploaded At", "Action"],
      rows: rows.map((entry) => ([
        entry.referenceId || "N/A",
        entry.customerName || "N/A",
        entry.mobileNumber || "N/A",
        {
          type: "preview",
          href: toAbsolutePrescriptionUrl(entry.fileUrl),
          mimeType: entry.mimeType || "",
          label: entry.fileName || "Prescription",
        },
        entry.fileName || "Prescription",
        entry.uploadedAt ? new Date(entry.uploadedAt).toLocaleString("en-IN") : "N/A",
        {
          type: "link",
          label: "View Prescription",
          href: toAbsolutePrescriptionUrl(entry.fileUrl),
          variant: "primary",
          external: true,
        },
      ])),
      emptyMessage: "No prescriptions have been uploaded yet.",
    };
  }

  if (section === "profile") {
    const [profilePayload, customerProfiles] = await Promise.all([
      adminUser ? fetchOwnProfile(adminUser) : Promise.resolve(null),
      readCustomerProfiles(),
    ]);
    return {
      title: "My Profile",
      description: "Create account: use Sign Up with full name, email, mobile number, gender, address, city, pincode, and password. Edit account: open Profile, update details, and click Save changes; use Change password only when required.",
      tableTitle: "Admin Profile",
      isProfileView: true,
      profilePayload,
      customerProfiles,
      columns: [],
      rows: [],
      emptyMessage: "Profile data not found.",
    };
  }

  if (section === "customers") {
    const [reviews, contacts, prescriptions] = await Promise.all([
      listRecentReviews(200).catch(() => []),
      listContactSubmissions(200).catch(() => []),
      listPrescriptionRecords(200).catch(() => []),
    ]);

    const customerMap = new Map();

    function normalizeKey(name, email, phone) {
      const safeEmail = String(email || "").trim().toLowerCase();
      const safePhone = String(phone || "").trim();
      const safeName = String(name || "").trim().toLowerCase();

      if (safeEmail) return `email:${safeEmail}`;
      if (safePhone) return `phone:${safePhone}`;
      if (safeName) return `name:${safeName}`;
      return null;
    }

    function upsertCustomer({ name, email, phone, source, activityAt, reviewInc = 0, messageInc = 0 }) {
      const key = normalizeKey(name, email, phone);
      if (!key) return;

      const existing = customerMap.get(key) || {
        name: "",
        email: "",
        phone: "",
        lastActivityAt: null,
        reviewCount: 0,
        messageCount: 0,
        sources: new Set(),
      };

      existing.name = existing.name || String(name || "").trim();
      existing.email = existing.email || String(email || "").trim();
      existing.phone = existing.phone || String(phone || "").trim();
      existing.reviewCount += reviewInc;
      existing.messageCount += messageInc;
      if (source) existing.sources.add(source);

      const parsedActivity = activityAt ? new Date(activityAt) : null;
      if (parsedActivity && !Number.isNaN(parsedActivity.getTime())) {
        if (!existing.lastActivityAt || parsedActivity > existing.lastActivityAt) {
          existing.lastActivityAt = parsedActivity;
        }
      }

      customerMap.set(key, existing);
    }

    for (const review of reviews) {
      upsertCustomer({
        name: review.reviewer_name,
        email: "",
        phone: "",
        source: "Review",
        activityAt: review.created_at,
        reviewInc: 1,
      });
    }

    for (const contact of contacts) {
      upsertCustomer({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        source: "Contact",
        activityAt: contact.created_at,
        messageInc: 1,
      });
    }

    for (const prescription of prescriptions) {
      upsertCustomer({
        name: prescription.customerName,
        email: "",
        phone: prescription.mobileNumber,
        source: "Prescription",
        activityAt: prescription.uploadedAt,
      });
    }

    const rows = Array.from(customerMap.values())
      .sort((a, b) => {
        const aTime = a.lastActivityAt ? a.lastActivityAt.getTime() : 0;
        const bTime = b.lastActivityAt ? b.lastActivityAt.getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 100)
      .map((customer) => ([
        customer.name || "Anonymous",
        customer.email || "N/A",
        customer.phone || "N/A",
        String(customer.reviewCount || 0),
        String(customer.messageCount || 0),
        customer.lastActivityAt ? customer.lastActivityAt.toLocaleDateString("en-IN") : "N/A",
        Array.from(customer.sources).join(", ") || "N/A",
      ]));

    return {
      title: "Customers",
      description: "Aggregated customer activity from backend reviews and contact submissions.",
      hideTable: true,
      promoBanner: {
        prefix: "Quick Buy!",
        highlight: "Get Upto 20% off",
        suffix: " on medicines*",
        actionLabel: "Quick order",
        actionHref: `${env.backendUrl}/admin/section/prescriptions`,
      },
      tableTitle: "Recent Customers",
      columns: ["Name", "Email", "Phone", "Reviews", "Messages", "Last Activity", "Source"],
      rows,
      emptyMessage: "No customer activity found yet.",
    };
  }

  throw new Error("Unsupported admin section.");
}

/**
 * Build chat composer data from query parameters - self-contained, no login activity dependency
 * Chat box loads its own data independently
 */
async function buildCustomerChatComposer(filters = {}) {
  const userId = String(filters.userId || "").trim();
  const email = String(filters.email || "").trim().toLowerCase();
  const phone = String(filters.phone || "").trim();
  const name = String(filters.name || "").trim() || "Customer";

  // Only fetch messages if at least one identifier is provided
  const messages = (userId || email || phone)
    ? await readCustomerChatMessages({ userId, email, phone })
    : [];

  return {
    userId,
    email,
    phone,
    name,
    messages,
    title: `Seller Chat with ${name}`,
    subtitle: "Send messages and updates directly to this customer.",
    action: `${env.backendUrl}/admin/customer-chat/send`,
  };
}

export async function renderLoginPage(req, res) {
  const adminToken = req.cookies?.adminToken;
  const errorMessage = req.query?.error || "";
  const successMessage = req.query?.success || "";

  res.render("admin/login", {
    adminBaseUrl: env.backendUrl,
    errorMessage,
    successMessage,
    isAuthenticated: !!adminToken,
  });
}

export async function renderSignupPage(req, res) {
  const adminToken = req.cookies?.adminToken;

  // Redirect if already authenticated
  if (adminToken) {
    return res.redirect("/admin/dashboard");
  }

  const errorMessage = req.query?.error || "";
  const successMessage = req.query?.success || "";

  res.render("admin/signup", {
    adminBaseUrl: env.backendUrl,
    errorMessage,
    successMessage,
  });
}

export async function renderDashboardPage(req, res) {
  const adminToken = req.cookies?.adminToken;

  // Redirect if not authenticated
  if (!adminToken) {
    return res.redirect("/admin/login");
  }

  let errorMessage = req.query?.error || "";
  let adminUser = null;
  let dashboardData = null;

  try {
    const context = await loadAdminPanelContext(adminToken);
    adminUser = context.adminUser;
    dashboardData = context.dashboardData;

    if (!adminUser) {
      res.clearCookie("adminToken");
      return res.redirect("/admin/login");
    }
  } catch (error) {
    errorMessage = error?.message || "Unable to load dashboard data.";
  }

  res.render("admin/dashboard", {
    adminBaseUrl: env.backendUrl,
    errorMessage,
    adminToken,
    backendUrl: env.backendUrl,
    adminUser,
    dashboardData,
  });
}

export async function renderContentManagerPage(req, res) {
  const suffix = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  return res.redirect(`/admin/content/home${suffix}`);
}

export async function renderContentEditorPage(req, res) {
  const adminToken = req.cookies?.adminToken;

  if (!adminToken) {
    return res.redirect("/admin/login");
  }

  const slug = String(req.params.slug || "").trim().toLowerCase();
  if (!["home", "about"].includes(slug)) {
    return res.redirect("/admin/content/home?error=Unsupported content section.");
  }

  let errorMessage = req.query?.error || "";
  const successMessage = req.query?.success || "";
  let adminUser = null;
  let contentData = null;

  try {
    const context = await loadAdminPanelContext(adminToken, { includeContent: true });
    adminUser = context.adminUser;

    if (!adminUser) {
      res.clearCookie("adminToken");
      return res.redirect("/admin/login");
    }

    contentData = slug === "home" ? context.homeContent : context.aboutContent;
  } catch (error) {
    errorMessage = error?.message || "Unable to load content editor.";
  }

  res.render("admin/content-editor", {
    adminBaseUrl: env.backendUrl,
    errorMessage,
    successMessage,
    adminUser,
    slug,
    contentData,
  });
}

export async function renderAdminSectionPage(req, res) {
  const adminToken = req.cookies?.adminToken;

  if (!adminToken) {
    return res.redirect("/admin/login");
  }

  const section = String(req.params.section || "").trim().toLowerCase();
  const supportedSections = ["products", "orders", "prescriptions", "customers", "reviews", "messages", "login-data", "profile"];
  if (!supportedSections.includes(section)) {
    return res.redirect("/admin/dashboard?error=Unsupported admin section.");
  }

  let errorMessage = req.query?.error || "";
  let successMessage = req.query?.success || "";
  let adminUser = null;
  let sectionData = null;

  try {
    const context = await loadAdminPanelContext(adminToken);
    adminUser = context.adminUser;

    if (!adminUser) {
      res.clearCookie("adminToken");
      return res.redirect("/admin/login");
    }

    sectionData = await loadSectionViewModel(section, req.query || {}, adminUser);
  } catch (error) {
    errorMessage = error?.message || "Unable to load admin section.";
    sectionData = {
      title: section.charAt(0).toUpperCase() + section.slice(1),
      description: "This section could not be loaded.",
      tableTitle: "Data",
      columns: [],
      rows: [],
      emptyMessage: "No data available.",
    };
  }

  res.render("admin/section-list", {
    adminBaseUrl: env.backendUrl,
    adminUser,
    errorMessage,
    successMessage,
    section,
    sectionData,
  });
}

export async function renderCustomerChatPage(req, res) {
  const adminToken = req.cookies?.adminToken;

  if (!adminToken) {
    return res.redirect("/admin/login");
  }

  let errorMessage = req.query?.error || "";
  const successMessage = req.query?.success || "";
  let adminUser = null;
  let chatComposer = null;

  try {
    const context = await loadAdminPanelContext(adminToken);
    adminUser = context.adminUser;

    if (!adminUser) {
      res.clearCookie("adminToken");
      return res.redirect("/admin/login");
    }

    // Chat box is now self-contained - build composer only if identifiers are provided
    if (req.query?.email || req.query?.phone || req.query?.userId) {
      chatComposer = await buildCustomerChatComposer(req.query || {});
    }
  } catch (error) {
    errorMessage = error?.message || "Unable to load customer chat.";
  }

  return res.render("admin/customer-chat", {
    adminBaseUrl: env.backendUrl,
    adminUser,
    errorMessage,
    successMessage,
    chatComposer,
  });
}

export async function handleAdminProfileUpdate(req, res) {
  const adminToken = req.cookies?.adminToken;

  if (!adminToken) {
    return res.redirect("/admin/login");
  }

  try {
    const adminUser = await getAdminFromToken(adminToken);

    if (!adminUser) {
      res.clearCookie("adminToken");
      return res.redirect("/admin/login");
    }

    const payload = {
      fullName: req.body?.fullName,
      email: req.body?.email,
      mobileNumber: req.body?.mobileNumber,
      gender: req.body?.gender,
      address: req.body?.address,
      city: req.body?.city,
      pincode: req.body?.pincode,
      currentPassword: req.body?.currentPassword,
      newPassword: req.body?.newPassword,
      confirmPassword: req.body?.confirmPassword,
    };

    const result = await updateOwnProfile(adminUser, payload);
    return res.redirect(`/admin/section/profile?success=${encodeURIComponent(result.message || "Profile updated.")}`);
  } catch (error) {
    const message = error?.message || "Unable to update profile.";
    return res.redirect(`/admin/section/profile?error=${encodeURIComponent(message)}`);
  }
}

export async function handleProductUpdate(req, res) {
  const adminToken = req.cookies?.adminToken;
  if (!adminToken) {
    return res.redirect("/admin/login");
  }

  const redirectParams = new URLSearchParams();
  redirectParams.set("page", String(Math.max(1, Number(req.body?.page) || 1)));
  redirectParams.set("limit", String(Math.max(10, Math.min(250, Number(req.body?.limit) || 100))));

  const searchQuery = String(req.body?.q || "").trim();
  if (searchQuery) {
    redirectParams.set("q", searchQuery);
  }

  const productId = String(req.body?.productId || "").trim();
  if (productId) {
    redirectParams.set("edit", productId);
  }

  try {
    const adminUser = await getAdminFromToken(adminToken);
    if (!adminUser) {
      res.clearCookie("adminToken");
      return res.redirect("/admin/login");
    }

    await saveProductChanges(productId, {
      itemName: req.body?.itemName,
      company: req.body?.company,
      generic: req.body?.generic,
      itemType: req.body?.itemType,
      category: req.body?.category,
      pack: req.body?.pack,
      mrp: req.body?.mrp,
    });

    redirectParams.delete("edit");
    redirectParams.set("success", "Product updated successfully.");
    return res.redirect(`/admin/section/products?${redirectParams.toString()}`);
  } catch (error) {
    redirectParams.set("error", error?.message || "Unable to update product.");
    return res.redirect(`/admin/section/products?${redirectParams.toString()}`);
  }
}

export async function handleContentUpdate(req, res) {
  const adminToken = req.cookies?.adminToken;
  if (!adminToken) {
    return res.redirect("/admin/login");
  }

  try {
    const adminUser = await getAdminFromToken(adminToken);
    if (!adminUser) {
      res.clearCookie("adminToken");
      return res.redirect("/admin/login");
    }

    const slug = String(req.params.slug || "").trim().toLowerCase();

    if (slug === "home") {
      const payload = buildHomePayload(req.body);
      const heroAsset = toUploadedAsset(getUploadedFile(req, "heroMediaFile"));
      const promoAsset = toUploadedAsset(getUploadedFile(req, "promoMediaFile"));

      if (heroAsset) {
        payload.hero.mediaUrl = heroAsset.mediaUrl;
        payload.hero.mediaType = heroAsset.mediaType;
        payload.hero.mediaMimeType = heroAsset.mediaMimeType;
      }

      if (promoAsset) {
        payload.promoBanner.mediaUrl = promoAsset.mediaUrl;
        payload.promoBanner.mediaType = promoAsset.mediaType;
        payload.promoBanner.mediaMimeType = promoAsset.mediaMimeType;
      }

      await saveHomeContent(payload);
    } else if (slug === "about") {
      const payload = buildAboutPayload(req.body);
      const aboutImageAsset = toUploadedAsset(getUploadedFile(req, "aboutStoryImageFile"));

      if (aboutImageAsset) {
        payload.storyImage.mediaUrl = aboutImageAsset.mediaUrl;
        payload.storyImage.mediaType = aboutImageAsset.mediaType;
        payload.storyImage.mediaMimeType = aboutImageAsset.mediaMimeType;
      }

      await saveAboutContent(payload);
    } else {
      throw new Error("Unsupported content section.");
    }

    return res.redirect(`/admin/content/${slug}?success=Content saved successfully.`);
  } catch (error) {
    const slug = String(req.params.slug || "").trim().toLowerCase();
    return res.redirect(`/admin/content/${slug}?error=${encodeURIComponent(error?.message || "Unable to save content.")}`);
  }
}

export async function handleSignup(req, res) {
  const { fullName, email, password, confirmPassword } = req.body;

  try {
    // Call backend API
    const response = await fetch(`${env.backendUrl}/api/v1/auth/sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.redirect(
        `/admin/signup?error=${encodeURIComponent(data.error || data.message || "Sign up failed")}`
      );
    }

    // Store token in httpOnly cookie
    res.cookie("adminToken", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Signup error:", error);
    res.redirect(`/admin/signup?error=${encodeURIComponent("An error occurred")}`);
  }
}

export async function handleSignin(req, res) {
  const { email, password } = req.body;

  try {
    const response = await fetch(`${env.backendUrl}/api/v1/auth/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.redirect(
        `/admin/login?error=${encodeURIComponent(data.error || data.message || "Login failed")}`
      );
    }

    // Store token in httpOnly cookie
    res.cookie("adminToken", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Signin error:", error);
    res.redirect(`/admin/login?error=${encodeURIComponent("An error occurred")}`);
  }
}

export async function handleSignout(req, res) {
  const adminToken = req.cookies?.adminToken;

  if (adminToken) {
    try {
      await fetch(`${env.backendUrl}/api/v1/auth/sign-out`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminToken}`,
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  // Clear cookie
  res.clearCookie("adminToken");
  res.redirect("/admin/login");
}

export async function handleMessageStatusUpdate(req, res) {
  const adminToken = req.cookies?.adminToken;

  if (!adminToken) {
    return res.redirect("/admin/login");
  }

  try {
    const adminUser = await getAdminFromToken(adminToken);
    if (!adminUser) {
      res.clearCookie("adminToken");
      return res.redirect("/admin/login");
    }

    const messageId = String(req.body?.messageId || "").trim();
    const status = String(req.body?.status || "").trim();

    if (!messageId) {
      throw new Error("Message id is required.");
    }

    await setMessageStatus(messageId, status);
    return res.redirect("/admin/section/messages");
  } catch (error) {
    return res.redirect(
      `/admin/section/messages?error=${encodeURIComponent(error?.message || "Unable to update message status.")}`
    );
  }
}

export async function handleSellerChatMessage(req, res) {
  const adminToken = req.cookies?.adminToken;
  if (!adminToken) {
    return res.redirect("/admin/login");
  }

  try {
    const adminUser = await getAdminFromToken(adminToken);
    if (!adminUser) {
      res.clearCookie("adminToken");
      return res.redirect("/admin/login");
    }

    const userId = String(req.body?.userId || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phone = String(req.body?.phone || "").trim();
    const name = String(req.body?.name || "").trim();
    let message = String(req.body?.message || "").trim();
    const attachment = req.file ? {
      url: `/uploads/${String(req.file.destination || "").split(/[\\/]/).pop() || "images"}/${req.file.filename}`,
      mimeType: String(req.file.mimetype || "").trim(),
      fileName: String(req.file.originalname || req.file.filename || "attachment").trim(),
    } : null;

    if (!message && !attachment) {
      message = "(no text)";
    }

    const createdMessage = await appendCustomerChatMessage({
      userId,
      email,
      phone,
      name,
      message,
      senderRole: "seller",
      senderName: adminUser.fullName || adminUser.email || "Seller",
      attachment,
    });

    publishCustomerChatEvent("message-created", { item: createdMessage });

    const redirectParams = new URLSearchParams();
    if (userId) redirectParams.set("userId", userId);
    if (email) redirectParams.set("email", email);
    if (phone) redirectParams.set("phone", phone);
    if (name) redirectParams.set("name", name);
    redirectParams.set("success", "Message sent successfully.");

    return res.redirect(`/admin/customer-chat?${redirectParams.toString()}`);
  } catch (error) {
    const userId = String(req.body?.userId || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phone = String(req.body?.phone || "").trim();
    const name = String(req.body?.name || "").trim();
    const redirectParams = new URLSearchParams();
    if (userId) redirectParams.set("userId", userId);
    if (email) redirectParams.set("email", email);
    if (phone) redirectParams.set("phone", phone);
    if (name) redirectParams.set("name", name);
    redirectParams.set("error", error?.message || "Unable to send seller message.");
    return res.redirect(`/admin/customer-chat?${redirectParams.toString()}`);
  }
}

/**
 * Render chat box management page - list of all chat threads
 */
export async function renderChatBoxPage(req, res) {
  const adminToken = req.cookies?.adminToken;

  if (!adminToken) {
    return res.redirect("/admin/login");
  }

  let errorMessage = req.query?.error || "";
  const successMessage = req.query?.success || "";
  let adminUser = null;
  let chatThreads = [];
  let chatStats = { totalThreads: 0, totalMessages: 0, unreadCount: 0 };

  try {
    const context = await loadAdminPanelContext(adminToken);
    adminUser = context.adminUser;

    if (!adminUser) {
      res.clearCookie("adminToken");
      return res.redirect("/admin/login");
    }

    // Get all login activities (these are our chat threads)
    const activities = await readLoginActivities();
    
    // Build chat threads with message counts and last message info
    chatThreads = activities.map((activity) => {
      return {
        id: activity.id,
        userId: activity.userId,
        email: activity.email,
        phone: activity.phone,
        name: activity.name,
        loginMethod: activity.loginMethod,
        lastLoginAt: activity.loggedInAt,
        city: activity.city,
        address: activity.address,
        imageUrl: activity.imageUrl,
      };
    });

    // Calculate stats
    chatStats.totalThreads = chatThreads.length;
    
    // Count total messages from all threads
    for (const thread of chatThreads) {
      const messages = await readCustomerChatMessages({
        userId: thread.userId,
        email: thread.email,
        phone: thread.phone,
      });
      chatStats.totalMessages += messages.length;
      
      // Count unread messages (status !== 'read')
      const unreadCount = messages.filter((msg) => msg.status !== 'read').length;
      chatStats.unreadCount += unreadCount;
    }
  } catch (error) {
    errorMessage = error?.message || "Unable to load chat box data.";
  }

  return res.render("admin/chat-box", {
    adminBaseUrl: env.backendUrl,
    adminUser,
    errorMessage,
    successMessage,
    chatThreads,
    chatStats,
  });
}

/**
 * API endpoint to fetch chat data on demand
 * Chat box uses this to load conversation data independently
 */
export async function fetchChatData(req, res, next) {
  const adminToken = req.cookies?.adminToken;

  if (!adminToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const adminUser = await getAdminFromToken(adminToken);
    if (!adminUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = String(req.query.userId || "").trim();
    const email = String(req.query.email || "").trim().toLowerCase();
    const phone = String(req.query.phone || "").trim();
    const name = String(req.query.name || "").trim() || "Customer";

    // Validate that at least one identifier is provided
    if (!userId && !email && !phone) {
      return res.status(400).json({ error: "At least one identifier (userId, email, or phone) is required" });
    }

    // Fetch messages for this chat thread
    const messages = await readCustomerChatMessages({ userId, email, phone });

    return res.json({
      success: true,
      data: {
        userId,
        email,
        phone,
        name,
        messages,
        title: `Seller Chat with ${name}`,
        subtitle: "Send messages and updates directly to this customer.",
        action: `/admin/customer-chat/send`,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteChat(req, res, next) {
  const adminToken = req.cookies?.adminToken;

  if (!adminToken) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    const adminUser = await getAdminFromToken(adminToken);
    if (!adminUser) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const messageId = String(req.body?.messageId || "").trim();
    if (!messageId) {
      return res.status(400).json({ success: false, error: "Message ID is required" });
    }

    const result = await deleteCustomerChatMessage(messageId);
    if (result?.success) {
      publishCustomerChatEvent("message-deleted", {
        deletedId: result.deletedId,
        deletedMessage: result.deletedMessage,
      });
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error?.message || "Failed to delete message" 
    });
  }
}
