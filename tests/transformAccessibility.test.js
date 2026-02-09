import { transformAccessibility } from "../src/services/transformAccessibility.js";

describe("transformAccessibility", () => {
  test("counts elevators and escalators", () => {
    const raw = {
      ElevatorIncidents: [
        { UnitType: "ELEVATOR", StationCode: "A01", SymptomDescription: "Out of service" },
        { UnitType: "ESCALATOR", StationCode: "A02", SymptomDescription: "Out of service https://wmata.com" },
      ],
    };

    const result = transformAccessibility(raw);
    expect(result.elevatorsDown).toBe(1);
    expect(result.escalatorsDown).toBe(1);
    expect(result.totalDown).toBe(2);
    expect(result.items[1].links.length).toBeGreaterThan(0);
  });
});
