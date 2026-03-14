import { badRequest, created, ok } from "../utils/http.js";
import {
  getAdminFromToken,
  signInAdmin,
  signOutAdmin,
  signUpAdmin,
  validateSignInPayload,
  validateSignUpPayload,
} from "../services/auth.service.js";

function extractBearerToken(req) {
  const authHeader = String(req.headers.authorization || "");
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return "";
  }

  return authHeader.slice(7).trim();
}

function getRequestMetadata(req) {
  return {
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || req.socket?.remoteAddress || "",
  };
}

export async function signUp(req, res, next) {
  try {
    const parsed = validateSignUpPayload(req.body || {});
    if (!parsed.success) {
      return badRequest(res, "Invalid sign-up payload.", parsed.error.flatten());
    }

    const payload = await signUpAdmin(parsed.data, getRequestMetadata(req));
    return created(res, payload);
  } catch (error) {
    if (error?.code === "ACCOUNT_EXISTS") {
      return badRequest(res, error.message);
    }

    return next(error);
  }
}

export async function signIn(req, res, next) {
  try {
    const parsed = validateSignInPayload(req.body || {});
    if (!parsed.success) {
      return badRequest(res, "Invalid sign-in payload.", parsed.error.flatten());
    }

    const payload = await signInAdmin(parsed.data, getRequestMetadata(req));
    return ok(res, payload);
  } catch (error) {
    if (
      error?.code === "ACCOUNT_NOT_FOUND"
      || error?.code === "ACCOUNT_INACTIVE"
      || error?.code === "INVALID_CREDENTIALS"
    ) {
      return badRequest(res, error.message);
    }

    return next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const user = await getAdminFromToken(token);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    return ok(res, { user });
  } catch (error) {
    return next(error);
  }
}

export async function signOut(req, res, next) {
  try {
    const token = extractBearerToken(req);
    await signOutAdmin(token);
    return ok(res, { message: "Signed out successfully." });
  } catch (error) {
    return next(error);
  }
}
