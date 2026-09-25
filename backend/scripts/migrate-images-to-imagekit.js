/**
 * One-off migration: move every image the platform already references into
 * ImageKit and rewrite the database to point at the new CDN URLs.
 *
 * Covers:
 *   - Service.imageUrl
 *   - Content "home".heroImage and "about".image
 *   - Order.fileUrl (customer uploads still living on local disk)
 *
 * Usage (from ./backend, with IMAGEKIT_* set in .env):
 *   node scripts/migrate-images-to-imagekit.js --dry      # preview only
 *   node scripts/migrate-images-to-imagekit.js            # apply
 *   node scripts/migrate-images-to-imagekit.js --remote   # also re-host remote URLs (e.g. Unsplash)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import prisma from "../src/lib/prisma.js";
import client, { imagekitEnabled, isImageKitUrl, FOLDERS } from "../src/utils/imagekit.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "../uploads");

const DRY = process.argv.includes("--dry");
const INCLUDE_REMOTE = process.argv.includes("--remote");

let moved = 0;
let skipped = 0;
let failed = 0;

function localPathFor(url) {
  const m = String(url).match(/\/uploads\/([^/?#]+)$/);
  if (!m) return null;
  const file = path.join(uploadsDir, decodeURIComponent(m[1]));
  return fs.existsSync(file) ? file : null;
}

/** Returns the new ImageKit URL, or null when nothing needed doing. */
async function rehost(url, { folder, tags }) {
  if (!url || isImageKitUrl(url)) {
    skipped++;
    return null;
  }

  const local = localPathFor(url);
  const isRemote = !local && /^https?:\/\//i.test(url);
  if (isRemote && !INCLUDE_REMOTE) {
    skipped++;
    return null;
  }
  if (!local && !isRemote) {
    skipped++;
    return null;
  }

  const fileName = path.basename(local || new URL(url).pathname) || `asset-${Date.now()}`;
  if (DRY) {
    console.log(`  would upload ${local ? "disk" : "remote"}: ${url}`);
    moved++;
    return null;
  }

  try {
    const res = await client.upload({
      // ImageKit accepts a Buffer, a base64 string, or a public URL to fetch.
      file: local ? fs.readFileSync(local) : url,
      fileName,
      folder,
      useUniqueFileName: true,
      tags: ["printwala", "migrated", ...tags],
    });
    moved++;
    console.log(`  ✓ ${url}\n    → ${res.url}`);
    return res.url;
  } catch (err) {
    failed++;
    console.warn(`  ✗ ${url}: ${err?.message || err}`);
    return null;
  }
}

async function migrateServices() {
  const services = await prisma.service.findMany({ where: { imageUrl: { not: null } } });
  console.log(`\nServices with images: ${services.length}`);
  for (const s of services) {
    const url = await rehost(s.imageUrl, { folder: FOLDERS.services, tags: ["service", s.slug] });
    if (url) await prisma.service.update({ where: { id: s.id }, data: { imageUrl: url } });
  }
}

async function migrateContent() {
  const keys = { home: ["heroImage"], about: ["image"] };
  for (const [key, fields] of Object.entries(keys)) {
    const row = await prisma.content.findUnique({ where: { key } });
    if (!row) continue;
    const value = { ...(row.value || {}) };
    let changed = false;
    console.log(`\nContent "${key}"`);
    for (const field of fields) {
      const url = await rehost(value[field], { folder: FOLDERS.content, tags: ["content", key] });
      if (url) {
        value[field] = url;
        changed = true;
      }
    }
    if (changed) await prisma.content.update({ where: { key }, data: { value } });
  }
}

async function migrateOrders() {
  const orders = await prisma.order.findMany({ where: { fileUrl: { not: null } } });
  console.log(`\nOrders with files: ${orders.length}`);
  for (const o of orders) {
    // Only pull files off local disk — never re-host someone else's link.
    if (!localPathFor(o.fileUrl)) {
      skipped++;
      continue;
    }
    const url = await rehost(o.fileUrl, { folder: FOLDERS.orders, tags: ["order", o.number] });
    if (url) await prisma.order.update({ where: { id: o.id }, data: { fileUrl: url } });
  }
}

async function main() {
  if (!imagekitEnabled) {
    console.error("IMAGEKIT_PUBLIC_KEY / IMAGEKIT_PRIVATE_KEY / IMAGEKIT_URL_ENDPOINT are not set.");
    process.exit(1);
  }
  console.log(DRY ? "DRY RUN — nothing will be uploaded or changed." : "Migrating media to ImageKit…");
  if (!INCLUDE_REMOTE) console.log("(remote URLs are left alone — pass --remote to re-host them too)");

  await migrateServices();
  await migrateContent();
  await migrateOrders();

  console.log(`\nDone. moved=${moved} skipped=${skipped} failed=${failed}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
