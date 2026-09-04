import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { asyncH, slugify } from "../utils/helpers.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAdmin);

/* ───────────────────────── Dashboard ───────────────────────── */
router.get(
  "/stats",
  asyncH(async (_req, res) => {
    const [orders, paid, services, users, revenue, recent, messages] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ["PAID", "PROCESSING", "COMPLETED"] } } }),
      prisma.service.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { amount: true },
        where: { status: { in: ["PAID", "PROCESSING", "COMPLETED"] } },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { service: true },
      }),
      prisma.contactMessage.count({ where: { handled: false } }),
    ]);
    res.json({
      stats: {
        orders,
        paidOrders: paid,
        services,
        users,
        revenue: revenue._sum.amount || 0,
        unreadMessages: messages,
      },
      recentOrders: recent.map((o) => ({
        id: o.id,
        number: o.number,
        status: o.status,
        amount: o.amount,
        customerName: o.customerName,
        service: o.service?.title,
        createdAt: o.createdAt,
      })),
    });
  })
);

/* ───────────────────────── Categories ───────────────────────── */
router.get(
  "/categories",
  asyncH(async (_req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json({ categories });
  })
);

router.post(
  "/categories",
  asyncH(async (req, res) => {
    const name = z.string().min(2).max(60).parse(req.body.name);
    const category = await prisma.category.create({
      data: { name, slug: slugify(name) },
    });
    res.status(201).json({ category });
  })
);

router.delete(
  "/categories/:id",
  asyncH(async (req, res) => {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

/* ───────────────────────── Services ───────────────────────── */
const fieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "number", "textarea", "select", "tel", "email", "date"]).default("text"),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
});

const serviceSchema = z.object({
  title: z.string().min(2).max(120),
  shortDesc: z.string().min(2).max(200),
  description: z.string().min(2).max(5000),
  price: z.coerce.number().int().min(0), // rupees from admin UI
  imageUrl: z.string().url().optional().or(z.literal("")),
  active: z.boolean().optional().default(true),
  featured: z.boolean().optional().default(false),
  requiresUpload: z.boolean().optional().default(false),
  uploadLabel: z.string().max(120).optional(),
  categoryId: z.string().optional().or(z.literal("")),
  fields: z.array(fieldSchema).optional().default([]),
});

router.get(
  "/services",
  asyncH(async (_req, res) => {
    const services = await prisma.service.findMany({
      include: { category: true, _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ services });
  })
);

router.get(
  "/services/:id",
  asyncH(async (req, res) => {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json({ service });
  })
);

async function uniqueSlug(base, ignoreId) {
  let slug = slugify(base);
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.service.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${slugify(base)}-${++n}`;
  }
}

router.post(
  "/services",
  asyncH(async (req, res) => {
    const data = serviceSchema.parse(req.body);
    const slug = await uniqueSlug(data.title);
    const service = await prisma.service.create({
      data: {
        slug,
        title: data.title,
        shortDesc: data.shortDesc,
        description: data.description,
        price: Math.round(data.price * 100),
        imageUrl: data.imageUrl || null,
        active: data.active,
        featured: data.featured,
        requiresUpload: data.requiresUpload,
        uploadLabel: data.uploadLabel || "Upload your file",
        categoryId: data.categoryId || null,
        fields: data.fields,
      },
    });
    res.status(201).json({ service });
  })
);

router.put(
  "/services/:id",
  asyncH(async (req, res) => {
    const data = serviceSchema.parse(req.body);
    const existing = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Service not found" });
    const slug = await uniqueSlug(data.title, existing.id);
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: {
        slug,
        title: data.title,
        shortDesc: data.shortDesc,
        description: data.description,
        price: Math.round(data.price * 100),
        imageUrl: data.imageUrl || null,
        active: data.active,
        featured: data.featured,
        requiresUpload: data.requiresUpload,
        uploadLabel: data.uploadLabel || "Upload your file",
        categoryId: data.categoryId || null,
        fields: data.fields,
      },
    });
    res.json({ service });
  })
);

router.delete(
  "/services/:id",
  asyncH(async (req, res) => {
    const count = await prisma.order.count({ where: { serviceId: req.params.id } });
    if (count > 0) {
      // keep history — soft delete by deactivating
      const service = await prisma.service.update({
        where: { id: req.params.id },
        data: { active: false },
      });
      return res.json({ ok: true, softDeleted: true, service });
    }
    await prisma.service.delete({ where: { id: req.params.id } });
    res.json({ ok: true, softDeleted: false });
  })
);

/* ───────────────────────── Content ───────────────────────── */
router.get(
  "/content/:key",
  asyncH(async (req, res) => {
    const content = await prisma.content.findUnique({ where: { key: req.params.key } });
    res.json({ key: req.params.key, value: content?.value ?? {} });
  })
);

router.put(
  "/content/:key",
  asyncH(async (req, res) => {
    const value = req.body?.value ?? {};
    const content = await prisma.content.upsert({
      where: { key: req.params.key },
      update: { value },
      create: { key: req.params.key, value },
    });
    res.json({ key: content.key, value: content.value });
  })
);

/* ───────────────────────── Orders ───────────────────────── */
router.get(
  "/orders",
  asyncH(async (req, res) => {
    const { status } = req.query;
    const where = {};
    if (status) where.status = String(status);
    const orders = await prisma.order.findMany({
      where,
      include: { service: true, user: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ orders });
  })
);

router.patch(
  "/orders/:id/status",
  asyncH(async (req, res) => {
    const status = z
      .enum(["PENDING", "PAID", "PROCESSING", "COMPLETED", "CANCELLED"])
      .parse(req.body.status);
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { service: true },
    });
    res.json({ order });
  })
);

/* ───────────────────────── Messages ───────────────────────── */
router.get(
  "/messages",
  asyncH(async (_req, res) => {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ messages });
  })
);

router.patch(
  "/messages/:id",
  asyncH(async (req, res) => {
    const handled = z.boolean().parse(req.body.handled);
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { handled },
    });
    res.json({ message });
  })
);

export default router;
