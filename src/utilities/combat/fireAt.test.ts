import type { IPlacementShip } from "../../types";
import { createEmptyGrid, createEmptyOccupancy } from "../grid/createEmptyGrid";
import { placeShip } from "../placement/placement";
import { createInitialFleetStatus } from "../ships/fleet";
import { fireAt } from "./fireAt";

const patrol: IPlacementShip = {
  name: "patrol boat",
  isHorizontal: true,
  length: 2,
};

function boardWithPatrol() {
  const placed = placeShip(
    createEmptyGrid(),
    createEmptyOccupancy(),
    { row: 0, col: 0 },
    patrol,
  );
  return {
    ...placed,
    fleet: createInitialFleetStatus(),
  };
}

describe("fireAt", () => {
  it("records a miss on an empty cell", () => {
    const { grid, occupancy, fleet } = boardWithPatrol();
    const result = fireAt(grid, occupancy, fleet, { row: 5, col: 5 });

    expect(result.valid).toBe(true);
    if (!result.valid) return;
    expect(result.hit).toBe(false);
    expect(result.grid[5][5].isShot).toBe(true);
    expect(result.fleet.remainingShips).toBe(5);
    expect(result.sunk).toBeNull();
    expect(result.won).toBe(false);
  });

  it("records a hit and decrements remainingHits", () => {
    const { grid, occupancy, fleet } = boardWithPatrol();
    const result = fireAt(grid, occupancy, fleet, { row: 0, col: 0 });

    expect(result.valid).toBe(true);
    if (!result.valid) return;
    expect(result.hit).toBe(true);
    expect(result.grid[0][0].isShot).toBe(true);
    expect(result.fleet.remainingHits["patrol boat"]).toBe(1);
    expect(result.fleet.remainingShips).toBe(5);
    expect(result.sunk).toBeNull();
  });

  it("rejects already-shot cells", () => {
    const { grid, occupancy, fleet } = boardWithPatrol();
    const first = fireAt(grid, occupancy, fleet, { row: 5, col: 5 });
    expect(first.valid).toBe(true);
    if (!first.valid) return;

    const second = fireAt(first.grid, occupancy, first.fleet, {
      row: 5,
      col: 5,
    });
    expect(second.valid).toBe(false);
  });

  it("sinks a ship when remainingHits reach 0 and decrements remainingShips", () => {
    const { grid, occupancy, fleet } = boardWithPatrol();
    const first = fireAt(grid, occupancy, fleet, { row: 0, col: 0 });
    expect(first.valid).toBe(true);
    if (!first.valid) return;

    const second = fireAt(first.grid, occupancy, first.fleet, {
      row: 0,
      col: 1,
    });
    expect(second.valid).toBe(true);
    if (!second.valid) return;
    expect(second.sunk).toBe("patrol boat");
    expect(second.fleet.remainingHits["patrol boat"]).toBe(0);
    expect(second.fleet.remainingShips).toBe(4);
  });

  it("marks won when remainingShips reach 0", () => {
    let grid = createEmptyGrid();
    let occupancy = createEmptyOccupancy();
    const placed = placeShip(grid, occupancy, { row: 0, col: 0 }, patrol);
    grid = placed.grid;
    occupancy = placed.occupancy;

    let fleet = createInitialFleetStatus();
    fleet = {
      remainingHits: {
        carrier: 0,
        battleship: 0,
        destroyer: 0,
        submarine: 0,
        "patrol boat": 2,
      },
      remainingShips: 1,
    };

    const first = fireAt(grid, occupancy, fleet, { row: 0, col: 0 });
    expect(first.valid).toBe(true);
    if (!first.valid) return;

    const second = fireAt(first.grid, occupancy, first.fleet, {
      row: 0,
      col: 1,
    });
    expect(second.valid).toBe(true);
    if (!second.valid) return;
    expect(second.won).toBe(true);
    expect(second.fleet.remainingShips).toBe(0);
  });
});
