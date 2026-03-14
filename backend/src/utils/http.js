export function ok(res, data, status = 200) {
  return res.status(status).json(data);
}

export function created(res, data) {
  return res.status(201).json(data);
}

export function badRequest(res, message, details) {
  return res.status(400).json({
    error: message,
    ...(details ? { details } : {}),
  });
}

export function notFound(res, message = "Resource not found.") {
  return res.status(404).json({ error: message });
}

export function serverError(res, message = "Internal server error.") {
  return res.status(500).json({ error: message });
}
