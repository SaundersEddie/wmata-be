import { refreshOnce } from "./refresh.js";

function inCommuteHoursLocal(date = new Date()) {
  const h = date.getHours();
  return h >= 7 && h < 18;
}

function getCadenceMs() {
  return inCommuteHoursLocal() ? 60_000 : 5 * 60_000;
}

function jitter(ms) {
  // +/- 10% jitter to avoid “on the minute” behavior
  const delta = Math.floor(ms * 0.1);
  const offset = Math.floor(Math.random() * (2 * delta + 1)) - delta;
  return Math.max(5_000, ms + offset);
}

let running = false;

async function tick() {
  const cadence = jitter(getCadenceMs());

  // Prevent overlap
  if (!running) {
    running = true;
    const result = await refreshOnce();
    if (!result.ok) console.warn("Refresh failed:", result.error);
    running = false;
  }

  setTimeout(tick, cadence);
}

export function startScheduler() {
  // Prime immediately, then loop
  tick();
}
