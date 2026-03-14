import { uploadBanner, getBanners, deleteBanner, updateBannerStatus } from "../repositories/banners.repository.js";

export async function createBanner({ file, title, description }) {
  if (!file) {
    throw new Error("No file provided.");
  }

  const fileUrl = `/uploads/${file.destination.split("/").pop()}/${file.filename}`;

  const banner = await uploadBanner({
    title: title || file.originalname,
    description: description || "",
    fileUrl,
    fileType: file.mimetype.startsWith("video") ? "video" : "image",
    fileSize: file.size,
    mimeType: file.mimetype,
  });

  return banner;
}

export async function fetchAllBanners() {
  return await getBanners();
}

export async function removeBanner(bannerId) {
  return await deleteBanner(bannerId);
}

export async function toggleBannerStatus(bannerId, isActive) {
  return await updateBannerStatus(bannerId, isActive);
}
