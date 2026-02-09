import { Router } from "express";
import { getCache } from "../cache/memoryCache.js";

const router = Router();

router.get("/status", (req, res) => {
  const { value, lastUpdated, stale } = getCache();
  res.set("Cache-Control", "no-store");
  res.json({
    data: value,
    meta: { lastUpdated, stale },
  });
});

export default router;
