import request from "supertest";
import nock from "nock";
import { createServer } from "../src/app.js";

describe("GET /api/status", () => {
  afterEach(() => nock.cleanAll());

  test("returns status payload", async () => {
    // Mock WMATA
    nock("https://api.wmata.com")
      .get("/Incidents.svc/json/Incidents")
      .reply(200, { Incidents: [] });

    const { app, start } = createServer();
    start(); // starts scheduler + primes once

    // Give the prime refresh a beat in this simple test
    await new Promise((r) => setTimeout(r, 50));

    const res = await request(app).get("/api/status").expect(200);
    expect(res.body).toHaveProperty("meta");
    expect(res.body).toHaveProperty("data");
    // data may be null if prime failed; but here it should be set:
    expect(res.body.data).not.toBeNull();
    expect(Array.isArray(res.body.data.lines)).toBe(true);
  });
});
