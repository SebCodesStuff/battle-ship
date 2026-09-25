import type { IGrid, IOccupancy, IPlacementShip } from "../../types";
import {
  createEmptyGrid,
  createEmptyOccupancy,
  GRID_SIZE,
} from "../grid/createEmptyGrid";
import { FLEET } from "../ships/fleet";
import { canPlaceShip, placeShip } from "./placement";

export type IRng = () => number;

export function placeRandomFleet(
  rng: IRng = Math.random,
): { grid: IGrid; occupancy: IOccupancy } {
  let grid = createEmptyGrid();
  let occupancy = createEmptyOccupancy();

  for (const definition of FLEET) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 1000) {
      attempts += 1;
      const isHorizontal = rng() < 0.5;
      const ship: IPlacementShip = {
        name: definition.name,
        length: definition.length,
        isHorizontal,
      };
      const maxRow = isHorizontal ? GRID_SIZE : GRID_SIZE - definition.length;
      const maxCol = isHorizontal ? GRID_SIZE - definition.length : GRID_SIZE;
      const row = Math.floor(rng() * maxRow);
      const col = Math.floor(rng() * maxCol);
      const head = { row, col };

      if (canPlaceShip(grid, head, ship)) {
        const result = placeShip(grid, occupancy, head, ship);
        grid = result.grid;
        occupancy = result.occupancy;
        placed = true;
      }
    }
    if (!placed) {
      throw new Error(`Unable to place ship: ${definition.name}`);
    }
  }

  return { grid, occupancy };
}
