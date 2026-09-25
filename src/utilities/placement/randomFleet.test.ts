import { GRID_SIZE } from "../grid/createEmptyGrid";
import { FLEET } from "../ships/fleet";
import { placeRandomFleet } from "./randomFleet";

function seededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("placeRandomFleet", () => {
  it("places all ships in bounds without overlap", () => {
    const { grid, occupancy } = placeRandomFleet(seededRng(42));

    let shipCells = 0;
    const names = new Set<string>();

    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const name = occupancy[row][col];
        if (name) {
          expect(grid[row][col].hasShip).toBe(true);
          shipCells += 1;
          names.add(name);
        } else {
          expect(grid[row][col].hasShip).toBe(false);
        }
      }
    }

    const expectedCells = FLEET.reduce((sum, s) => sum + s.length, 0);
    expect(shipCells).toBe(expectedCells);
    expect(names.size).toBe(FLEET.length);
  });

  it("is deterministic with a seeded RNG", () => {
    const a = placeRandomFleet(seededRng(7));
    const b = placeRandomFleet(seededRng(7));
    expect(a.occupancy).toEqual(b.occupancy);
  });
});
