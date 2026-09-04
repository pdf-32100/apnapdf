import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { asyncH } from "../utils/helpers.js";

const router = Router();

// Public: read a content block by key (home, about, contact, settings...)
router.get(
  "/:key",
  asyncH(async (req, res) => {
    const content = await prisma.content.findUnique({ where: { key: req.params.key } });
    res.json({ key: req.params.key, value: content?.value ?? {} });
  })
);

// Public: submit a contact message
const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  subject: z.string().max(120).optional(),
  message: z.string().min(5).max(4000),
});

router.post(
  "/contact/message",
  asyncH(async (req, res) => {
    const data = contactSchema.parse(req.body);
    await prisma.contactMessage.create({ data });
    res.status(201).json({ ok: true, message: "Thanks! We'll get back to you soon." });
  })
);

export default router;
