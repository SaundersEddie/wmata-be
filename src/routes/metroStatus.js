// src/routes/metroStatus.js
import { Router } from "express";
import { getCache } from "../cache/memoryCache.js";

const router = Router();

router.get("/status/metro", (req, res) => {
  const { value, lastUpdated, stale } = getCache();

  res.json({
    meta: { lastUpdated, stale },
    data: value?.metro ?? null,
  });
});

export default router;
