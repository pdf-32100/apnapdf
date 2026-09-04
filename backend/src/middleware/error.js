import { ZodError } from "zod";

export function notFound(_req, res) {
  res.status(404).json({ error: "Not found" });
}

// Central error handler. Express needs the 4-arg signature.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: "Validation failed",
      details: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
    });
  }
  // Prisma unique constraint
  if (err?.code === "P2002") {
    return res.status(409).json({ error: "A record with that value already exists" });
  }
  if (err?.type === "entity.too.large" || err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File is too large" });
  }
  if (err?.status && err?.expose) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error("[error]", err);
  res.status(500).json({ error: "Internal server error" });
}

// helper to throw HTTP errors that reach the handler cleanly
export function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  e.expose = true;
  return e;
}
