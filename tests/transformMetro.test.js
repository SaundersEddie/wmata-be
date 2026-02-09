import { transformMetroIncidents } from "../src/services/transformMetro.js";

describe("transformMetroIncidents", () => {
  test("returns all lines with Normal status when no incidents", () => {
    const result = transformMetroIncidents({ Incidents: [] });

    expect(result.lines).toHaveLength(6);
    result.lines.forEach((line) => {
      expect(line.status).toBe("Normal");
      expect(line.serviceIncidents).toHaveLength(0);
      expect(line.infoAlerts).toHaveLength(0);
    });
  });

  test("marks service-impacting incidents as Major and puts them in serviceIncidents", () => {
    const raw = {
      Incidents: [
        {
          IncidentID: "123",
          LinesAffected: "RD; BL;",
          IncidentType: "Delay",
          Description: "Signal problem near Metro Center. Expect delays.",
          DateUpdated: "2026-02-09T12:00:00",
        },
      ],
    };

    const result = transformMetroIncidents(raw);

    const red = result.lines.find((l) => l.code === "RD");
    const blue = result.lines.find((l) => l.code === "BL");
    const yellow = result.lines.find((l) => l.code === "YL");

    expect(red.status).toBe("Major");
    expect(blue.status).toBe("Major");
    expect(yellow.status).toBe("Normal");

    expect(red.serviceIncidents).toHaveLength(1);
    expect(red.infoAlerts).toHaveLength(0);
    expect(red.serviceIncidents[0]).toMatchObject({
      id: "123",
      severity: "Major",
    });
  });

  test("routes entrance closure into infoAlerts and marks line Minor", () => {
    const raw = {
      Incidents: [
        {
          IncidentID: "1",
          LinesAffected: "GR;",
          IncidentType: "Alert",
          Description:
            "Beginning Mon, Sept 29th, thru March 2026. The entrance will be closed due to escalator replacement.",
          DateUpdated: "2026-02-09T12:00:00",
        },
      ],
    };

    const result = transformMetroIncidents(raw);
    const green = result.lines.find((l) => l.code === "GR");

    expect(green.status).toBe("Minor");
    expect(green.infoAlerts).toHaveLength(1);
    expect(green.serviceIncidents).toHaveLength(0);
    expect(green.infoAlerts[0]).toMatchObject({
      id: "1",
      severity: "Minor",
    });
  });

  test("ignores unknown line codes", () => {
    const raw = {
      Incidents: [
        {
          IncidentID: "999",
          LinesAffected: "RD; ZZ;",
          IncidentType: "Alert",
          Description: "Test incident",
        },
      ],
    };

    const result = transformMetroIncidents(raw);
    const red = result.lines.find((l) => l.code === "RD");

    expect(red.serviceIncidents.length + red.infoAlerts.length).toBe(1);
  });

  test("adds summary and extracts links", () => {
    const raw = {
      Incidents: [
        {
          IncidentID: "linktest",
          LinesAffected: "GR;",
          IncidentType: "Alert",
          Description:
            "Beginning Mon, Sept 29th, thru March 2026. The entrance will be closed. For info https://wmata.com",
        },
      ],
    };

    const result = transformMetroIncidents(raw);
    const green = result.lines.find((l) => l.code === "GR");
    const alert = green.infoAlerts[0];

    expect(alert.summary).toMatch(/entrance will be closed/i);
    expect(alert.summary).not.toMatch(/beginning/i);
    expect(alert.links.length).toBeGreaterThan(0);
    expect(alert.description).not.toMatch(/https?:\/\//i);
  });
});
