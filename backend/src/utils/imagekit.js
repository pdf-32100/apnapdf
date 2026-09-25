/**
 * ImageKit.io integration.
 *
 * Every image and customer upload in the platform goes through here:
 *  - admin service images + site content images (/api/admin/uploads/image)
 *  - customer booking files (orders route)
 *
 * When the three IMAGEKIT_* env vars are missing we fall back to the old
 * local-disk behaviour so `npm run dev` still works without an account.
 */
import ImageKit from "imagekit";
import path from "node:path";
import env from "../config/env.js";

export const imagekitEnabled = env.imagekit.enabled;

const client = imagekitEnabled
  ? new ImageKit({
      publicKey: env.imagekit.publicKey,
      privateKey: env.imagekit.privateKey,
      urlEndpoint: env.imagekit.urlEndpoint,
    })
  : null;

/** Folders we organise the media library into. */
export const FOLDERS = {
  services: `${env.imagekit.folder}/services`,
  content: `${env.imagekit.folder}/content`,
  orders: `${env.imagekit.folder}/orders`,
};

// ImageKit rejects some characters in file names.
function safeName(originalName = "file") {
  const ext = path.extname(originalName).toLowerCase().slice(0, 10);
  const base = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "file"}-${Date.now()}${ext}`;
}

/**
 * Upload a buffer to ImageKit.
 * @returns {Promise<{url:string,fileId:string,filePath:string,name:string,thumbnailUrl:string|null,width:number|null,height:number|null}>}
 */
export async function uploadBuffer({ buffer, fileName, folder, tags = [] }) {
  if (!client) throw new Error("ImageKit is not configured");

  const res = await client.upload({
    file: buffer,
    fileName: safeName(fileName),
    folder: folder || FOLDERS.content,
    useUniqueFileName: true,
    tags: ["printwala", ...tags].filter(Boolean),
  });

  return {
    url: res.url,
    fileId: res.fileId,
    filePath: res.filePath,
    name: res.name,
    thumbnailUrl: res.thumbnailUrl || null,
    width: res.width ?? null,
    height: res.height ?? null,
  };
}

/** Delete a file from the media library. Never throws — deletion is best-effort. */
export async function deleteFile(fileId) {
  if (!client || !fileId) return false;
  try {
    await client.deleteFile(fileId);
    return true;
  } catch (err) {
    console.warn("[imagekit] delete failed:", err?.message || err);
    return false;
  }
}

/** True when the URL is served by our ImageKit endpoint. */
export function isImageKitUrl(url) {
  if (!url || !imagekitEnabled) return false;
  return String(url).startsWith(env.imagekit.urlEndpoint);
}

/**
 * Build a transformed URL (resize / format / quality) for an ImageKit asset.
 * Non-ImageKit URLs are returned untouched so existing links keep working.
 */
export function transformUrl(url, transformation = []) {
  if (!isImageKitUrl(url) || !client) return url;
  return client.url({ src: url, transformation });
}

export default client;
