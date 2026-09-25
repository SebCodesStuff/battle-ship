import type {
  ICoord,
  IFleetStatus,
  IGrid,
  IOccupancy,
  IShipName,
} from "../../types";

export type IFireAtResult =
  | { valid: false }
  | {
      valid: true;
      grid: IGrid;
      fleet: IFleetStatus;
      hit: boolean;
      sunk: IShipName | null;
      won: boolean;
    };

export function fireAt(
  grid: IGrid,
  occupancy: IOccupancy,
  fleet: IFleetStatus,
  coord: ICoord,
): IFireAtResult {
  const { row, col } = coord;
  if (grid[row][col].isShot) {
    return { valid: false };
  }

  const nextGrid = grid.map((r) => r.map((cell) => ({ ...cell })));
  nextGrid[row][col] = { ...nextGrid[row][col], isShot: true };

  const shipName = occupancy[row][col];
  if (!shipName) {
    return {
      valid: true,
      grid: nextGrid,
      fleet,
      hit: false,
      sunk: null,
      won: false,
    };
  }

  const remainingHits = {
    ...fleet.remainingHits,
    [shipName]: fleet.remainingHits[shipName] - 1,
  };
  let remainingShips = fleet.remainingShips;
  let sunk: IShipName | null = null;

  if (remainingHits[shipName] === 0) {
    remainingShips -= 1;
    sunk = shipName;
  }

  const nextFleet: IFleetStatus = { remainingHits, remainingShips };

  return {
    valid: true,
    grid: nextGrid,
    fleet: nextFleet,
    hit: true,
    sunk,
    won: remainingShips === 0,
  };
}
