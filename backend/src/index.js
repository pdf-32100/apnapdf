import express from "express";
import cors from "cors";
import morgan from "morgan";

import env from "./config/env.js";
import { attachUser } from "./middleware/auth.js";
import { notFound, errorHandler } from "./middleware/error.js";
import { uploadsDir } from "./middleware/upload.js";
import { isMock } from "./utils/razorpay.js";
import { imagekitEnabled } from "./utils/imagekit.js";

import authRoutes from "./routes/auth.js";
import serviceRoutes from "./routes/services.js";
import contentRoutes from "./routes/content.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, cb) {
      // allow non-browser tools (no origin) and any configured origin
      if (!origin || env.corsOrigins.includes(origin) || env.corsOrigins.includes("*")) {
        return cb(null, true);
      }
      cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(attachUser);

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir));

app.get("/", (_req, res) => res.json({ name: "PrintWala API", status: "ok" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// Public config the frontend needs (payment mode, key id)
app.get("/api/config", (_req, res) => {
  res.json({
    razorpay: { keyId: env.razorpay.keyId || null, mock: isMock },
    imagekit: {
      enabled: imagekitEnabled,
      urlEndpoint: env.imagekit.urlEndpoint || null,
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`\n  PrintWala API listening on http://localhost:${env.port}`);
  console.log(`  Payments: ${isMock ? "MOCK mode (no keys set)" : "Razorpay LIVE keys"}`);
  console.log(`  Images:   ${imagekitEnabled ? `ImageKit (${env.imagekit.urlEndpoint})` : "local ./uploads (ImageKit keys not set)"}`);
  console.log(`  CORS origins: ${env.corsOrigins.join(", ")}\n`);
});
