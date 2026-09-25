import type {
  IFleetStatus,
  IShipDefinition,
  IShipName,
} from "../../types";

export const FLEET: readonly IShipDefinition[] = [
  { name: "carrier", length: 5 },
  { name: "battleship", length: 4 },
  { name: "destroyer", length: 3 },
  { name: "submarine", length: 3 },
  { name: "patrol boat", length: 2 },
] as const;

export function createInitialFleetStatus(): IFleetStatus {
  const remainingHits = {} as Record<IShipName, number>;
  for (const ship of FLEET) {
    remainingHits[ship.name] = ship.length;
  }
  return {
    remainingHits,
    remainingShips: FLEET.length,
  };
}
