import { fetchAboutContent, fetchHomeContent, fetchSeoMeta } from "../services/content.service.js";
import { notFound, ok } from "../utils/http.js";

export async function getHomeContent(req, res, next) {
  try {
    return ok(res, await fetchHomeContent());
  } catch (error) {
    return next(error);
  }
}

export async function getAboutContent(req, res, next) {
  try {
    return ok(res, await fetchAboutContent());
  } catch (error) {
    return next(error);
  }
}

export async function getSeoMeta(req, res, next) {
  try {
    const seo = await fetchSeoMeta(req.params.pageSlug);
    if (!seo) {
      return notFound(res, "SEO metadata not found.");
    }

    return ok(res, { page: req.params.pageSlug, seo });
  } catch (error) {
    return next(error);
  }
}
