import { verifyToken } from "../lib/token.js";

// Attaches req.user when a valid Bearer token is present. Never throws.
export function attachUser(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme === "Bearer" && token) {
    try {
      const payload = verifyToken(token);
      req.user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
        name: payload.name,
      };
    } catch {
      // ignore invalid tokens — route guards decide what to do
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin access required" });
  next();
}
