// tests/wmataClient.test.js
import nock from "nock";
import { fetchIncidents } from "../src/services/wmataClient.js";

describe("fetchIncidents", () => {
  const oldKey = process.env.WMATA_API_KEY;

  beforeEach(() => {
    process.env.WMATA_API_KEY = "test-key";
  });

  afterEach(() => {
    process.env.WMATA_API_KEY = oldKey;
    nock.cleanAll();
  });

  test("returns parsed JSON on 200", async () => {
    nock("https://api.wmata.com")
      .get("/Incidents.svc/json/Incidents")
      .reply(200, { Incidents: [] });

    const data = await fetchIncidents();
    expect(data).toEqual({ Incidents: [] });
  });

  test("throws on non-200", async () => {
    nock("https://api.wmata.com")
      .get("/Incidents.svc/json/Incidents")
      .reply(500, "nope");

    await expect(fetchIncidents()).rejects.toThrow(/WMATA 500/i);
  });
});
