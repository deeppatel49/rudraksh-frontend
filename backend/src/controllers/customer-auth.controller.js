import { badRequest, created, ok } from "../utils/http.js";
import {
  accountExistsForIdentifier,
  getCustomerSessionByUserId,
  getRecoveryContactsForIdentifier,
  loginCustomerWithGoogle,
  loginCustomerWithPassword,
  recordCustomerLoginActivity,
  registerCustomer,
  resetCustomerPassword,
  updateCustomerProfileData,
  validateCustomerGoogleLoginPayload,
  validateCustomerPasswordLoginPayload,
  validateCustomerRegisterPayload,
  validateResetPasswordPayload,
  validateUpdateCustomerProfilePayload,
} from "../services/customer-auth.service.js";

function getRequestMetadata(req) {
  return {
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || req.socket?.remoteAddress || "",
  };
}

export async function register(req, res, next) {
  try {
    const parsed = validateCustomerRegisterPayload(req.body || {});
    if (!parsed.success) {
      return badRequest(res, "Invalid registration payload.", parsed.error.flatten());
    }

    const payload = await registerCustomer(parsed.data);
    return created(res, payload);
  } catch (error) {
    if (error?.code === "ACCOUNT_EXISTS" || error?.code === "INVALID_IDENTIFIER" || error?.code === "INVALID_MOBILE") {
      return badRequest(res, error.message);
    }

    return next(error);
  }
}

export async function loginWithPassword(req, res, next) {
  try {
    const parsed = validateCustomerPasswordLoginPayload(req.body || {});
    if (!parsed.success) {
      return badRequest(res, "Invalid sign-in payload.", parsed.error.flatten());
    }

    const payload = await loginCustomerWithPassword(parsed.data, getRequestMetadata(req));
    return ok(res, payload);
  } catch (error) {
    if (
      error?.code === "ACCOUNT_NOT_FOUND"
      || error?.code === "GOOGLE_ONLY_ACCOUNT"
      || error?.code === "INVALID_PASSWORD"
    ) {
      return badRequest(res, error.message);
    }

    return next(error);
  }
}

export async function loginWithGoogle(req, res, next) {
  try {
    const parsed = validateCustomerGoogleLoginPayload(req.body || {});
    if (!parsed.success) {
      return badRequest(res, "Invalid Google sign-in payload.", parsed.error.flatten());
    }

    const payload = await loginCustomerWithGoogle(parsed.data, getRequestMetadata(req));
    return ok(res, payload);
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const parsed = validateResetPasswordPayload(req.body || {});
    if (!parsed.success) {
      return badRequest(res, "Invalid reset-password payload.", parsed.error.flatten());
    }

    const payload = await resetCustomerPassword(parsed.data);
    return ok(res, payload);
  } catch (error) {
    if (error?.code === "ACCOUNT_NOT_FOUND") {
      return badRequest(res, error.message);
    }

    return next(error);
  }
}

export async function getSession(req, res, next) {
  try {
    const userId = String(req.query?.userId || "").trim();
    if (!userId) {
      return badRequest(res, "userId is required.");
    }

    const session = await getCustomerSessionByUserId(userId);
    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }

    return ok(res, session);
  } catch (error) {
    return next(error);
  }
}

export async function checkAccountExists(req, res, next) {
  try {
    const identifier = String(req.query?.identifier || "").trim();
    if (!identifier) {
      return badRequest(res, "identifier is required.");
    }

    const exists = await accountExistsForIdentifier(identifier);
    return ok(res, { exists });
  } catch (error) {
    return next(error);
  }
}

export async function getRecoveryContacts(req, res, next) {
  try {
    const identifier = String(req.query?.identifier || "").trim();
    if (!identifier) {
      return badRequest(res, "identifier is required.");
    }

    const contacts = await getRecoveryContactsForIdentifier(identifier);
    if (!contacts) {
      return res.status(404).json({ error: "Account not found." });
    }

    return ok(res, { contacts });
  } catch (error) {
    return next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const parsed = validateUpdateCustomerProfilePayload(req.body || {});
    if (!parsed.success) {
      return badRequest(res, "Invalid profile payload.", parsed.error.flatten());
    }

    const payload = await updateCustomerProfileData(parsed.data);
    return ok(res, payload);
  } catch (error) {
    if (error?.code === "ACCOUNT_NOT_FOUND") {
      return badRequest(res, error.message);
    }

    return next(error);
  }
}

export async function createLoginActivity(req, res, next) {
  try {
    const payload = req.body || {};
    const loginMethod = String(payload?.loginMethod || "").trim().toLowerCase();
    if (!payload?.userId || (loginMethod !== "manual" && loginMethod !== "google")) {
      return badRequest(res, "A valid userId and login method are required.");
    }

    const record = await recordCustomerLoginActivity({
      ...payload,
      loginMethod,
      userAgent: req.headers["user-agent"] || payload?.userAgent || "",
      ipAddress: req.ip || req.socket?.remoteAddress || payload?.ipAddress || "",
    });

    return created(res, { success: true, record });
  } catch (error) {
    return next(error);
  }
}
