import { createEmptyOccupancy } from "../grid/createEmptyGrid";
import { listPlacedShips } from "./placedShips";

describe("listPlacedShips", () => {
  it("returns a horizontal carrier from its bow cell", () => {
    const occupancy = createEmptyOccupancy();
    for (let col = 0; col < 5; col += 1) {
      occupancy[1][col] = "carrier";
    }

    expect(listPlacedShips(occupancy)).toEqual([
      {
        name: "carrier",
        isHorizontal: true,
        head: { row: 1, col: 0 },
        length: 5,
      },
    ]);
  });

  it("returns a vertical patrol boat from its bow cell", () => {
    const occupancy = createEmptyOccupancy();
    occupancy[0][2] = "patrol boat";
    occupancy[1][2] = "patrol boat";

    expect(listPlacedShips(occupancy)).toEqual([
      {
        name: "patrol boat",
        isHorizontal: false,
        head: { row: 0, col: 2 },
        length: 2,
      },
    ]);
  });
});
