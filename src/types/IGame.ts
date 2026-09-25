import type { IGrid } from "./IGrid";
import type { IFleetStatus, IOccupancy } from "./IFleet";
import type { IPlacementShip, IShipName } from "./IShip";

export type ICoord = {
  row: number;
  col: number;
};

export type IGamePhase = "placing" | "playing" | "finished";

export type ITurn = "player" | "computer";

export type IOwner = "player" | "opponent";

export type IAnnouncement =
  | { kind: "sunk"; owner: IOwner; shipName: IShipName }
  | { kind: "winner"; winner: IOwner };

export type IGameState = {
  phase: IGamePhase;
  turn: ITurn;
  playerGrid: IGrid;
  opponentGrid: IGrid;
  playerOccupancy: IOccupancy;
  opponentOccupancy: IOccupancy;
  playerFleet: IFleetStatus;
  opponentFleet: IFleetStatus;
  placementShip: IPlacementShip | null;
  placementIndex: number;
  cursor: ICoord;
  announcements: IAnnouncement[];
  winner: IOwner | null;
};
