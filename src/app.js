import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import statusRouter from "./routes/status.js";
import { startScheduler } from "./jobs/scheduler.js";

export function createServer() {
  const app = express();

  app.use(helmet());
  app.use(express.json());

  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 120, // generous for dev; tighten if you ever deploy
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get("/health", (req, res) => res.json({ ok: true }));
  app.use("/api", statusRouter);

  return {
    app,
    start: () => startScheduler(),
  };
}
