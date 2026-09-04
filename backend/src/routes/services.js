import { Router } from "express";
import prisma from "../lib/prisma.js";
import { asyncH } from "../utils/helpers.js";

const router = Router();

// Public: list active services (optionally by category slug or search)
router.get(
  "/",
  asyncH(async (req, res) => {
    const { category, q, featured } = req.query;
    const where = { active: true };
    if (category) where.category = { slug: String(category) };
    if (featured === "true") where.featured = true;
    if (q) {
      where.OR = [
        { title: { contains: String(q), mode: "insensitive" } },
        { shortDesc: { contains: String(q), mode: "insensitive" } },
        { description: { contains: String(q), mode: "insensitive" } },
      ];
    }
    const services = await prisma.service.findMany({
      where,
      include: { category: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    res.json({ services });
  })
);

// Public: categories with counts
router.get(
  "/categories",
  asyncH(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { services: { where: { active: true } } } } },
    });
    res.json({
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: c._count.services,
      })),
    });
  })
);

// Public: single service by slug
router.get(
  "/:slug",
  asyncH(async (req, res) => {
    const service = await prisma.service.findUnique({
      where: { slug: req.params.slug },
      include: { category: true },
    });
    if (!service || !service.active) return res.status(404).json({ error: "Service not found" });
    res.json({ service });
  })
);

export default router;
