import type { IGrid, IOccupancy } from "../../types";

export const GRID_SIZE = 10;

export function createEmptyGrid(): IGrid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      hasShip: false,
      isShot: false,
    })),
  );
}

export function createEmptyOccupancy(): IOccupancy {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null),
  );
}
