import { submitContact, validateContactPayload } from "../services/contact.service.js";
import { badRequest, created } from "../utils/http.js";

export async function postContact(req, res, next) {
  try {
    const parsed = validateContactPayload(req.body);
    if (!parsed.success) {
      return badRequest(res, "Invalid contact payload.", parsed.error.flatten());
    }

    return created(res, await submitContact(parsed.data));
  } catch (error) {
    return next(error);
  }
}
