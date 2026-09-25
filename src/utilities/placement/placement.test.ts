import type { IPlacementShip } from "../../types";
import { createEmptyGrid, createEmptyOccupancy } from "../grid/createEmptyGrid";
import { canPlaceShip, getShipCells, placeShip } from "./placement";

const carrier: IPlacementShip = {
  name: "carrier",
  isHorizontal: true,
  length: 5,
};

describe("getShipCells", () => {
  it("returns horizontal cells from the head", () => {
    expect(getShipCells({ row: 2, col: 1 }, carrier)).toEqual([
      { row: 2, col: 1 },
      { row: 2, col: 2 },
      { row: 2, col: 3 },
      { row: 2, col: 4 },
      { row: 2, col: 5 },
    ]);
  });

  it("returns vertical cells from the head", () => {
    expect(
      getShipCells(
        { row: 0, col: 3 },
        { ...carrier, isHorizontal: false },
      ),
    ).toEqual([
      { row: 0, col: 3 },
      { row: 1, col: 3 },
      { row: 2, col: 3 },
      { row: 3, col: 3 },
      { row: 4, col: 3 },
    ]);
  });
});

describe("canPlaceShip", () => {
  it("allows a valid in-bounds placement", () => {
    const grid = createEmptyGrid();
    expect(canPlaceShip(grid, { row: 0, col: 0 }, carrier)).toBe(true);
  });

  it("rejects placements that go outside the grid", () => {
    const grid = createEmptyGrid();
    expect(canPlaceShip(grid, { row: 0, col: 6 }, carrier)).toBe(false);
  });

  it("rejects overlapping placements", () => {
    const grid = createEmptyGrid();
    const occupancy = createEmptyOccupancy();
    const placed = placeShip(grid, occupancy, { row: 0, col: 0 }, carrier);

    expect(
      canPlaceShip(placed.grid, { row: 0, col: 2 }, {
        name: "battleship",
        isHorizontal: true,
        length: 4,
      }),
    ).toBe(false);
  });
});

describe("placeShip", () => {
  it("marks cells with hasShip and occupancy", () => {
    const grid = createEmptyGrid();
    const occupancy = createEmptyOccupancy();
    const result = placeShip(grid, occupancy, { row: 1, col: 0 }, carrier);

    expect(result.grid[1][0].hasShip).toBe(true);
    expect(result.grid[1][4].hasShip).toBe(true);
    expect(result.grid[1][5].hasShip).toBe(false);
    expect(result.occupancy[1][0]).toBe("carrier");
    expect(result.occupancy[1][4]).toBe("carrier");
  });
});
