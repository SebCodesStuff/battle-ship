import type {
  IAnnouncement,
  ICoord,
  IGameState,
  IOwner,
  IPlacementShip,
} from "../../types";
import { fireAt } from "../combat/fireAt";
import {
  createEmptyGrid,
  createEmptyOccupancy,
  GRID_SIZE,
} from "../grid/createEmptyGrid";
import { canPlaceShip, placeShip } from "../placement/placement";
import { placeRandomFleet, type IRng } from "../placement/randomFleet";
import { createInitialFleetStatus, FLEET } from "../ships/fleet";

function placementShipAt(
  index: number,
  isHorizontal: boolean,
): IPlacementShip | null {
  const definition = FLEET[index];
  if (!definition) return null;
  return {
    name: definition.name,
    length: definition.length,
    isHorizontal,
  };
}

export function createInitialGameState(rng: IRng = Math.random): IGameState {
  const opponent = placeRandomFleet(rng);
  return {
    phase: "placing",
    turn: "player",
    playerGrid: createEmptyGrid(),
    opponentGrid: opponent.grid,
    playerOccupancy: createEmptyOccupancy(),
    opponentOccupancy: opponent.occupancy,
    playerFleet: createInitialFleetStatus(),
    opponentFleet: createInitialFleetStatus(),
    placementShip: placementShipAt(0, true),
    placementIndex: 0,
    cursor: { row: 0, col: 0 },
    announcements: [],
    winner: null,
  };
}

export function moveCursor(state: IGameState, delta: ICoord): IGameState {
  if (state.phase !== "placing" || !state.placementShip) return state;
  const row = Math.min(
    GRID_SIZE - 1,
    Math.max(0, state.cursor.row + delta.row),
  );
  const col = Math.min(
    GRID_SIZE - 1,
    Math.max(0, state.cursor.col + delta.col),
  );
  return { ...state, cursor: { row, col } };
}

export function setCursor(state: IGameState, cursor: ICoord): IGameState {
  if (state.phase === "finished") return state;
  return {
    ...state,
    cursor: {
      row: Math.min(GRID_SIZE - 1, Math.max(0, cursor.row)),
      col: Math.min(GRID_SIZE - 1, Math.max(0, cursor.col)),
    },
  };
}

export function flipPlacementShip(state: IGameState): IGameState {
  if (state.phase !== "placing" || !state.placementShip) return state;
  return {
    ...state,
    placementShip: {
      ...state.placementShip,
      isHorizontal: !state.placementShip.isHorizontal,
    },
  };
}

export function placeCurrentShip(state: IGameState): IGameState {
  if (state.phase !== "placing" || !state.placementShip) return state;
  if (!canPlaceShip(state.playerGrid, state.cursor, state.placementShip)) {
    return state;
  }

  const placed = placeShip(
    state.playerGrid,
    state.playerOccupancy,
    state.cursor,
    state.placementShip,
  );
  const nextIndex = state.placementIndex + 1;
  const nextShip = placementShipAt(
    nextIndex,
    state.placementShip.isHorizontal,
  );

  if (!nextShip) {
    return {
      ...state,
      playerGrid: placed.grid,
      playerOccupancy: placed.occupancy,
      placementIndex: nextIndex,
      placementShip: null,
      phase: "playing",
      turn: "player",
      cursor: { row: 0, col: 0 },
    };
  }

  return {
    ...state,
    playerGrid: placed.grid,
    playerOccupancy: placed.occupancy,
    placementIndex: nextIndex,
    placementShip: nextShip,
    cursor: { row: 0, col: 0 },
  };
}

function appendAnnouncements(
  existing: IAnnouncement[],
  sunk: IAnnouncement | null,
  won: IAnnouncement | null,
): IAnnouncement[] {
  const next = [...existing];
  if (sunk) next.push(sunk);
  if (won) next.push(won);
  return next;
}

export function fireAsPlayer(state: IGameState, coord: ICoord): IGameState {
  if (state.phase !== "playing" || state.turn !== "player") return state;

  const result = fireAt(
    state.opponentGrid,
    state.opponentOccupancy,
    state.opponentFleet,
    coord,
  );
  if (!result.valid) return state;

  const sunkAnnouncement: IAnnouncement | null = result.sunk
    ? { kind: "sunk", owner: "opponent", shipName: result.sunk }
    : null;
  const winAnnouncement: IAnnouncement | null = result.won
    ? { kind: "winner", winner: "player" }
    : null;

  return {
    ...state,
    opponentGrid: result.grid,
    opponentFleet: result.fleet,
    announcements: appendAnnouncements(
      state.announcements,
      sunkAnnouncement,
      winAnnouncement,
    ),
    winner: result.won ? "player" : state.winner,
    phase: result.won ? "finished" : state.phase,
    turn: result.won ? state.turn : "computer",
  };
}

export function fireAsComputer(state: IGameState, coord: ICoord): IGameState {
  if (state.phase !== "playing" || state.turn !== "computer") return state;

  const result = fireAt(
    state.playerGrid,
    state.playerOccupancy,
    state.playerFleet,
    coord,
  );
  if (!result.valid) return state;

  const sunkAnnouncement: IAnnouncement | null = result.sunk
    ? { kind: "sunk", owner: "player", shipName: result.sunk }
    : null;
  const winAnnouncement: IAnnouncement | null = result.won
    ? { kind: "winner", winner: "opponent" }
    : null;

  return {
    ...state,
    playerGrid: result.grid,
    playerFleet: result.fleet,
    announcements: appendAnnouncements(
      state.announcements,
      sunkAnnouncement,
      winAnnouncement,
    ),
    winner: result.won ? ("opponent" as IOwner) : state.winner,
    phase: result.won ? "finished" : state.phase,
    turn: result.won ? state.turn : "player",
  };
}
