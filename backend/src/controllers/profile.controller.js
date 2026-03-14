import { badRequest, ok } from "../utils/http.js";
import { fetchOwnProfile, updateOwnProfile } from "../services/profile.service.js";

export async function getOwnProfile(req, res, next) {
  try {
    const payload = await fetchOwnProfile(req.adminUser);
    return ok(res, payload);
  } catch (error) {
    return next(error);
  }
}

export async function patchOwnProfile(req, res, next) {
  try {
    const payload = await updateOwnProfile(req.adminUser, req.body || {});
    return ok(res, payload);
  } catch (error) {
    if (error?.code === "VALIDATION_ERROR") {
      return badRequest(res, error.message, error.details);
    }

    return next(error);
  }
}
