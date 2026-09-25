import { createEmptyGrid, createEmptyOccupancy } from "./createEmptyGrid";

describe("createEmptyGrid", () => {
  it("creates a 10x10 grid of empty cells", () => {
    const grid = createEmptyGrid();

    expect(grid).toHaveLength(10);
    expect(grid.every((row) => row.length === 10)).toBe(true);
    expect(grid[0][0]).toEqual({ hasShip: false, isShot: false });
    expect(grid[9][9]).toEqual({ hasShip: false, isShot: false });
  });
});

describe("createEmptyOccupancy", () => {
  it("creates a 10x10 occupancy map of nulls", () => {
    const occupancy = createEmptyOccupancy();

    expect(occupancy).toHaveLength(10);
    expect(occupancy.every((row) => row.length === 10)).toBe(true);
    expect(occupancy[0][0]).toBeNull();
    expect(occupancy[5][5]).toBeNull();
  });
});
