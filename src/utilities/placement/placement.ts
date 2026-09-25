import type {
  ICoord,
  IGrid,
  IOccupancy,
  IPlacementShip,
} from "../../types";
import { GRID_SIZE } from "../grid/createEmptyGrid";

export function getShipCells(head: ICoord, ship: IPlacementShip): ICoord[] {
  return Array.from({ length: ship.length }, (_, i) =>
    ship.isHorizontal
      ? { row: head.row, col: head.col + i }
      : { row: head.row + i, col: head.col },
  );
}

export function canPlaceShip(
  grid: IGrid,
  head: ICoord,
  ship: IPlacementShip,
): boolean {
  const cells = getShipCells(head, ship);
  return cells.every(
    ({ row, col }) =>
      row >= 0 &&
      row < GRID_SIZE &&
      col >= 0 &&
      col < GRID_SIZE &&
      !grid[row][col].hasShip,
  );
}

export function placeShip(
  grid: IGrid,
  occupancy: IOccupancy,
  head: ICoord,
  ship: IPlacementShip,
): { grid: IGrid; occupancy: IOccupancy } {
  const cells = getShipCells(head, ship);
  const nextGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
  const nextOccupancy = occupancy.map((row) => [...row]);

  for (const { row, col } of cells) {
    nextGrid[row][col] = { ...nextGrid[row][col], hasShip: true };
    nextOccupancy[row][col] = ship.name;
  }

  return { grid: nextGrid, occupancy: nextOccupancy };
}
