import { getAdminFromToken } from "../services/auth.service.js";

function extractBearerToken(authHeader) {
  const safeValue = String(authHeader || "");
  if (!safeValue.toLowerCase().startsWith("bearer ")) {
    return "";
  }

  return safeValue.slice(7).trim();
}

export async function requireAdminAuth(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const user = await getAdminFromToken(token);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    req.adminUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
}
