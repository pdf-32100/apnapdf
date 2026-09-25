import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import env from "../config/env.js";
import { imagekitEnabled, uploadBuffer, FOLDERS } from "../utils/imagekit.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.resolve(__dirname, "../../uploads");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Files are held in memory so they can be streamed straight to ImageKit.
// Without ImageKit credentials we write them to ./uploads instead.
const storage = multer.memoryStorage();

const DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/avif", "image/gif"];

const filterFor = (allowed) => (_req, file, cb) => {
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(Object.assign(new Error("Unsupported file type"), { status: 400, expose: true }));
};

/** Customer booking uploads: documents or images, up to 20 MB. */
export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: filterFor([...DOC_TYPES, ...IMAGE_TYPES]),
});

/** Admin media-library uploads: images only, up to 10 MB. */
export const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: filterFor(IMAGE_TYPES),
});

function writeToDisk(file) {
  const id = crypto.randomBytes(8).toString("hex");
  const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
  const filename = `${Date.now()}-${id}${ext}`;
  fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
  return {
    url: `${env.publicUrl}/uploads/${filename}`,
    fileId: null,
    filePath: `/uploads/${filename}`,
    name: file.originalname,
    thumbnailUrl: null,
    width: null,
    height: null,
    provider: "local",
  };
}

/**
 * Persist an uploaded multer file and return its public URL.
 * Uses ImageKit when configured, local disk otherwise.
 *
 * @param {Express.Multer.File} file
 * @param {{folder?: string, tags?: string[]}} opts
 */
export async function persistFile(file, { folder = FOLDERS.content, tags = [] } = {}) {
  if (!file) return null;

  if (!imagekitEnabled) return writeToDisk(file);

  try {
    const result = await uploadBuffer({
      buffer: file.buffer,
      fileName: file.originalname,
      folder,
      tags,
    });
    return { ...result, provider: "imagekit" };
  } catch (err) {
    // Never lose a customer's file because the CDN hiccuped.
    console.error("[imagekit] upload failed, falling back to local disk:", err?.message || err);
    return writeToDisk(file);
  }
}

export { FOLDERS };
