import type { IShipName } from "./IShip";

export type IFleetStatus = {
  remainingHits: Record<IShipName, number>;
  remainingShips: number;
};

export type IOccupancy = (IShipName | null)[][];
