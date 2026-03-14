import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import adminPanelRoutes from "./routes/admin-panel.routes.js";
import bannersRoutes from "./routes/banners.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { sessionMiddleware } from "./middleware/session.middleware.js";
import contactRoutes from "./routes/contact.routes.js";
import contentRoutes from "./routes/content.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import productsRoutes from "./routes/products.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import customerChatRoutes from "./routes/customer-chat.routes.js";
import customerProfilesRoutes from "./routes/customer-profiles.routes.js";
import customerAuthRoutes from "./routes/customer-auth.routes.js";
import messageStatusRoutes from "./routes/message-status.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use((req, res, next) => {
  // Used by EJS inline scripts to satisfy CSP without enabling unsafe-inline.
  res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
  res.locals.adminBaseUrl = env.backendUrl;
  res.locals.backendUrl = env.backendUrl;
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", (_req, res) => `'nonce-${res.locals.cspNonce}'`],
        "img-src": ["'self'", "data:", "http:", "https:"],
      },
    },
  })
);
app.use(cors({ origin: [env.frontendUrl], credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Session middleware for admin panel
app.use(sessionMiddleware);

// Serve uploaded files
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", env.frontendUrl || "*");
    next();
  },
  express.static(path.join(__dirname, "../public/uploads"))
);

// Admin panel routes (UI pages)
app.use("/admin", adminPanelRoutes);

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Rudraksh backend is running.",
    docs: {
      health: "/health",
      api: "/api",
      apiV1: "/api/v1",
      adminPanel: "/admin/login",
    },
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "rudraksh-backend", timestamp: new Date().toISOString() });
});

app.get("/api", (_req, res) => {
  res.json({
    status: "ok",
    message: "Rudraksh backend API is running.",
    version: "v1",
    baseUrl: "/api/v1",
  });
});

app.get("/api/v1", (_req, res) => {
  res.json({
    status: "ok",
    message: "API v1 route index",
    endpoints: [
      "/api/v1/products",
      "/api/v1/reviews",
      "/api/v1/orders",
      "/api/v1/contact",
      "/api/v1/content",
      "/api/v1/auth",
      "/api/v1/dashboard",
      "/api/v1/banners",
      "/api/v1/profile",
      "/api/v1/customer-chat",
      "/api/v1/customer-auth",
      "/api/v1/message-status",
      "/api/v1/prescriptions",
    ],
  });
});

app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/reviews", reviewsRoutes);
app.use("/api/v1/orders", ordersRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/banners", bannersRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/customer-chat", customerChatRoutes);
app.use("/api/v1/customer-profiles", customerProfilesRoutes);
app.use("/api/v1/customer-auth", customerAuthRoutes);
app.use("/api/v1/message-status", messageStatusRoutes);
app.use("/api/v1/prescriptions", prescriptionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
