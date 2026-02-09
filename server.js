import "dotenv/config";
import { createServer } from "./src/app.js";

const { app, start } = createServer();
const port = Number(process.env.PORT || 4000);

// For “dev-only, no outsiders”: bind localhost only.
app.listen(port, "127.0.0.1", () => {
  console.log(`API listening on http://127.0.0.1:${port}`);
  start();
});
