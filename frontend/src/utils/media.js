import { resolveApiUrl } from "../config/env";

export const toAssetUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads/")) return resolveApiUrl(path);
  return resolveApiUrl(`/uploads/${path}`);
};
