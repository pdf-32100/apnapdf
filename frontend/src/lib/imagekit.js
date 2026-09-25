/**
 * ImageKit URL helpers.
 *
 * Every image in the app is rendered through these so the CDN does the
 * resizing, format negotiation (AVIF/WebP) and compression for us.
 *
 * URLs that are not on our ImageKit endpoint (Unsplash placeholders, an
 * admin-pasted link, local /uploads in dev) pass through untouched.
 */

const ENV_ENDPOINT = (import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || "").replace(/\/$/, "");

// The backend also reports the endpoint at /api/config; SiteContext calls this
// so a deployment only has to set the env var on the server. We cache it so the
// very first paint after a reload already knows which URLs we can transform.
const CACHE_KEY = "pw_ik_endpoint";

function readCache() {
  try {
    return localStorage.getItem(CACHE_KEY) || "";
  } catch {
    return "";
  }
}

let runtimeEndpoint = readCache();

export function setImageKitEndpoint(url) {
  runtimeEndpoint = (url || "").replace(/\/$/, "");
  try {
    if (runtimeEndpoint) localStorage.setItem(CACHE_KEY, runtimeEndpoint);
    else localStorage.removeItem(CACHE_KEY);
  } catch {
    /* private mode — in-memory only */
  }
}

export function imagekitEndpoint() {
  return runtimeEndpoint || ENV_ENDPOINT;
}

export function isImageKitUrl(src) {
  if (!src || typeof src !== "string") return false;
  const endpoint = imagekitEndpoint();
  if (endpoint && src.startsWith(endpoint)) return true;
  // Default ImageKit domain, for setups that never set the env var.
  return /^https?:\/\/ik\.imagekit\.io\//.test(src);
}

/**
 * Turn an options object into an ImageKit transformation string.
 * See https://imagekit.io/docs/transformations
 */
function trString({ width, height, crop, focus, quality, format, blur, dpr, radius } = {}) {
  const parts = [];
  if (width) parts.push(`w-${Math.round(width)}`);
  if (height) parts.push(`h-${Math.round(height)}`);
  // "maintain_ratio" + cm-extract/pad_resize etc. `c-at_max` never upscales.
  parts.push(`c-${crop || (width && height ? "maintain_ratio" : "at_max")}`);
  if (width && height) parts.push(`fo-${focus || "auto"}`);
  parts.push(`q-${quality ?? 80}`);
  parts.push(`f-${format || "auto"}`);
  if (dpr) parts.push(`dpr-${dpr}`);
  if (blur) parts.push(`bl-${blur}`);
  if (radius) parts.push(`r-${radius}`);
  return parts.join(",");
}

/** Build a transformed URL. Non-ImageKit sources are returned as-is. */
export function ikUrl(src, opts = {}) {
  if (!isImageKitUrl(src)) return src;
  try {
    const url = new URL(src);
    const existing = url.searchParams.get("tr");
    const tr = trString(opts);
    url.searchParams.set("tr", existing ? `${existing}:${tr}` : tr);
    return url.toString();
  } catch {
    return src;
  }
}

/** Responsive srcSet across a set of widths. */
export function ikSrcSet(src, widths = [400, 800, 1200, 1600], opts = {}) {
  if (!isImageKitUrl(src)) return undefined;
  const ratio = opts.width && opts.height ? opts.height / opts.width : null;
  return widths
    .map((w) => `${ikUrl(src, { ...opts, width: w, height: ratio ? Math.round(w * ratio) : undefined })} ${w}w`)
    .join(", ");
}

/** Tiny blurred placeholder (LQIP) shown while the real image decodes. */
export function ikPlaceholder(src) {
  if (!isImageKitUrl(src)) return null;
  return ikUrl(src, { width: 24, quality: 20, blur: 6 });
}
