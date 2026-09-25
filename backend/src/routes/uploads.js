/**
 * Admin media endpoints — mounted at /api/admin/uploads (admin-only).
 *
 * The browser posts the raw file here and the server forwards it to ImageKit
 * with the private key, so credentials never reach the client.
 */
import { Router } from "express";
import { z } from "zod";

import env from "../config/env.js";
import { asyncH } from "../utils/helpers.js";
import { uploadImage, persistFile, FOLDERS } from "../middleware/upload.js";
import { imagekitEnabled, deleteFile } from "../utils/imagekit.js";

const router = Router();

const FOLDER_BY_KIND = {
  service: FOLDERS.services,
  content: FOLDERS.content,
};

router.get("/config", (_req, res) => {
  res.json({
    enabled: imagekitEnabled,
    urlEndpoint: env.imagekit.urlEndpoint || null,
    folder: env.imagekit.folder,
    maxSizeMb: 10,
  });
});

// POST /api/admin/uploads/image   (multipart, field name: "image")
router.post(
  "/image",
  uploadImage.single("image"),
  asyncH(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No image was uploaded" });

    const kind = z.enum(["service", "content"]).catch("content").parse(req.body?.kind);
    const stored = await persistFile(req.file, {
      folder: FOLDER_BY_KIND[kind],
      tags: [kind],
    });

    res.status(201).json({ image: stored });
  })
);

// DELETE /api/admin/uploads/:fileId — removes an asset from the media library.
router.delete(
  "/:fileId",
  asyncH(async (req, res) => {
    const ok = await deleteFile(req.params.fileId);
    res.json({ ok });
  })
);

export default router;
