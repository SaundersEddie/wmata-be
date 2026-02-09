import request from "supertest";
import nock from "nock";
import { createServer } from "../src/app.js";

describe("GET /api/status", () => {
  afterEach(() => nock.cleanAll());

  test("returns status payload", async () => {
    nock("https://api.wmata.com")
      .get("/Incidents.svc/json/Incidents")
      .reply(200, { Incidents: [] });

    const { app, start } = createServer();
    start();

    await new Promise((r) => setTimeout(r, 50));

    const res = await request(app).get("/api/status").expect(200);

    expect(res.body).toHaveProperty("meta");
    expect(res.body).toHaveProperty("data");

    expect(res.body.data).not.toBeNull();
    expect(res.body.data).toHaveProperty("metro");
    expect(Array.isArray(res.body.data.metro.lines)).toBe(true);
  });
});
