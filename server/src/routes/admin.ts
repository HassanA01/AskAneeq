import { Router } from "express";
import type { AnalyticsStore } from "../analytics/store.js";

export function createAdminRouter(
  store: AnalyticsStore,
  adminToken: string | undefined
): Router {
  const router = Router();

  router.use((_req, res, next) => {
    if (!adminToken) {
      res.status(503).json({ error: "Admin token not configured" });
      return;
    }
    const auth = _req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ") || auth.slice(7) !== adminToken) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  });

  router.get("/summary", (_req, res) => {
    res.json({
      toolCounts: store.getToolCounts(),
      categoryCounts: store.getCategoryCounts(),
    });
  });

  router.get("/events", (req, res) => {
    const parsed = parseInt(req.query.limit as string, 10);
    const limit = Number.isFinite(parsed) && parsed > 0 ? parsed : 50;
    res.json({ events: store.getRecentEvents(limit) });
  });

  return router;
}
