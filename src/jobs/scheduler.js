import cron from "node-cron";
import { refreshOnce } from "./refresh.js";

function inCommuteHoursNY(date = new Date()) {
  // Your machine is local; if you deploy elsewhere, you’d want TZ handling.
  const h = date.getHours();
  return h >= 7 && h < 18;
}

export function startScheduler() {
  // Run every minute; decide whether to actually refresh.
  // Simple + reliable (no dynamic cron juggling).
  let lastRan = 0;

  cron.schedule("* * * * *", async () => {
    const now = Date.now();
    const cadenceMs = inCommuteHoursNY() ? 60_000 : 5 * 60_000;

    if (now - lastRan < cadenceMs - 500) return;

    lastRan = now;
    const result = await refreshOnce();
    if (!result.ok) console.warn("Refresh failed:", result.error);
  });

  // Prime immediately on boot:
  refreshOnce().then((r) => {
    if (!r.ok) console.warn("Initial refresh failed:", r.error);
  });
}
