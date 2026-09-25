import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import env from "../config/env.js";
import { asyncH, makeOrderNumber } from "../utils/helpers.js";
import { requireAuth } from "../middleware/auth.js";
import { upload, persistFile, FOLDERS } from "../middleware/upload.js";
import {
  createPaymentOrder,
  verifyPaymentSignature,
  isMock,
} from "../utils/razorpay.js";

const router = Router();

const createSchema = z.object({
  serviceId: z.string().min(1),
  customerName: z.string().min(2).max(80),
  customerEmail: z.string().email(),
  customerPhone: z.string().max(20).optional().or(z.literal("")),
  details: z.record(z.any()).optional(),
  quantity: z.coerce.number().int().min(1).max(1000).optional(),
});

function serializeOrder(o) {
  return {
    id: o.id,
    number: o.number,
    status: o.status,
    amount: o.amount,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    details: o.details,
    fileUrl: o.fileUrl,
    fileName: o.fileName,
    paidAt: o.paidAt,
    createdAt: o.createdAt,
    service: o.service
      ? { id: o.service.id, title: o.service.title, slug: o.service.slug, imageUrl: o.service.imageUrl }
      : undefined,
  };
}

// Create an order (booking). Accepts multipart/form-data with an optional file.
// Non-file fields arrive as strings; `details` is a JSON string.
router.post(
  "/",
  upload.single("file"),
  asyncH(async (req, res) => {
    const body = { ...req.body };
    if (typeof body.details === "string") {
      try {
        body.details = JSON.parse(body.details);
      } catch {
        body.details = {};
      }
    }
    const data = createSchema.parse(body);

    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service || !service.active) return res.status(404).json({ error: "Service not available" });

    if (service.requiresUpload && !req.file) {
      return res.status(400).json({ error: "This service requires a file upload" });
    }

    const quantity = data.quantity && data.quantity > 0 ? data.quantity : 1;
    const amount = service.price * quantity;

    // Store the customer's file on ImageKit (local disk when not configured).
    const stored = await persistFile(req.file, {
      folder: FOLDERS.orders,
      tags: ["order", service.slug],
    });
    const fileUrl = stored?.url || null;
    const fileName = req.file ? req.file.originalname : null;

    // Attach the logged-in user if a valid token was sent.
    const userId = req.user?.id ?? null;

    const order = await prisma.order.create({
      data: {
        number: makeOrderNumber(),
        status: "PENDING",
        amount,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || null,
        details: { ...(data.details || {}), quantity },
        fileUrl,
        fileName,
        serviceId: service.id,
        userId,
      },
      include: { service: true },
    });

    // Create the payment order (real Razorpay or mock).
    const payment = await createPaymentOrder({
      amount,
      receipt: order.number,
      notes: { orderId: order.id, service: service.title },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: payment.id },
    });

    res.status(201).json({
      order: serializeOrder(order),
      payment: {
        razorpayOrderId: payment.id,
        amount,
        currency: "INR",
        keyId: env.razorpay.keyId || null,
        mock: isMock,
      },
    });
  })
);

// Verify payment and mark the order paid.
const verifySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().optional().default(""),
});

router.post(
  "/:id/verify",
  asyncH(async (req, res) => {
    const data = verifySchema.parse(req.body);
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status === "PAID" || order.status === "COMPLETED") {
      return res.json({ order: serializeOrder(await withService(order.id)) });
    }
    if (order.razorpayOrderId !== data.razorpayOrderId) {
      return res.status(400).json({ error: "Payment does not match this order" });
    }

    const valid = verifyPaymentSignature({
      orderId: data.razorpayOrderId,
      paymentId: data.razorpayPaymentId,
      signature: data.razorpaySignature,
    });
    if (!valid) {
      await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      return res.status(400).json({ error: "Payment verification failed" });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        razorpayPaymentId: data.razorpayPaymentId,
        razorpaySignature: data.razorpaySignature,
        paidAt: new Date(),
      },
      include: { service: true },
    });
    res.json({ order: serializeOrder(updated) });
  })
);

async function withService(id) {
  return prisma.order.findUnique({ where: { id }, include: { service: true } });
}

// Fetch a single order (confirmation / checkout page). Guessable id acts as token.
router.get(
  "/:id",
  asyncH(async (req, res) => {
    const order = await withService(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ order: serializeOrder(order) });
  })
);

// Logged-in user's orders
router.get(
  "/mine/list",
  requireAuth,
  asyncH(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { service: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ orders: orders.map(serializeOrder) });
  })
);

export default router;
