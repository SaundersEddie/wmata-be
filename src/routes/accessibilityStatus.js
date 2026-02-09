import { Router } from "express";
import { getCache } from "../cache/memoryCache.js";

const router = Router();

router.get("/status/accessibility", (req, res) => {
  const { value, lastUpdated, stale } = getCache();
  res.json({
    meta: { lastUpdated, stale },
    data: value?.accessibility ?? null,
  });
});

export default router;
