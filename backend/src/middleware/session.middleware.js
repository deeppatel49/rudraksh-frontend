/**
 * Session middleware for admin panel
 * Checks for admin token in cookies and attach to request
 */
export function sessionMiddleware(req, res, next) {
  if (req.path?.startsWith("/admin")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
  }

  const token = req.cookies?.adminToken;
  if (token) {
    req.adminToken = token;
  }
  next();
}

/**
 * Check if admin is authenticated (has valid token in cookie)
 */
export function requireSessionAuth(req, res, next) {
  const token = req.cookies?.adminToken;
  if (!token) {
    return res.redirect('/admin/login');
  }
  req.adminToken = token;
  next();
}
