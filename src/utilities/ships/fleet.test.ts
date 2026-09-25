import type { IFleetStatus, IShipName } from "../../types";
import { FLEET, createInitialFleetStatus } from "./fleet";

describe("FLEET", () => {
  it("defines the five standard ships with correct lengths", () => {
    expect(FLEET).toEqual([
      { name: "carrier", length: 5 },
      { name: "battleship", length: 4 },
      { name: "destroyer", length: 3 },
      { name: "submarine", length: 3 },
      { name: "patrol boat", length: 2 },
    ]);
  });
});

describe("createInitialFleetStatus", () => {
  it("starts remainingHits at full length and remainingShips at 5", () => {
    const status: IFleetStatus = createInitialFleetStatus();
    const names = FLEET.map((s) => s.name) as IShipName[];

    expect(status.remainingShips).toBe(5);
    for (const ship of FLEET) {
      expect(status.remainingHits[ship.name]).toBe(ship.length);
    }
    expect(Object.keys(status.remainingHits).sort()).toEqual(
      [...names].sort(),
    );
  });
});
