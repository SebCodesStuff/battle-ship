import type { IPlacementShip } from "../../types";
import {
  chooseComputerShot,
  createEmptyKnowledge,
} from "../combat/computerShot";
import { FLEET } from "../ships/fleet";
import {
  createInitialGameState,
  fireAsComputer,
  fireAsPlayer,
  flipPlacementShip,
  moveCursor,
  placeCurrentShip,
  takeComputerTurn,
} from "./gameState";

function seededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function placeAllPlayerShips() {
  let state = createInitialGameState(seededRng(1));
  for (let i = 0; i < FLEET.length; i += 1) {
    // Place each ship on its own row horizontally at col 0
    state = { ...state, cursor: { row: i, col: 0 } };
    if (state.placementShip && !state.placementShip.isHorizontal) {
      state = flipPlacementShip(state);
    }
    state = placeCurrentShip(state);
  }
  return state;
}

describe("createInitialGameState", () => {
  it("starts in placing phase with first ship horizontal at cursor 0,0", () => {
    const state = createInitialGameState(seededRng(3));
    expect(state.phase).toBe("placing");
    expect(state.turn).toBe("player");
    expect(state.placementShip).toEqual({
      name: "carrier",
      isHorizontal: true,
      length: 5,
    } satisfies IPlacementShip);
    expect(state.cursor).toEqual({ row: 0, col: 0 });
    expect(state.opponentFleet.remainingShips).toBe(5);
    expect(state.computerKnowledge).toEqual(createEmptyKnowledge());
  });
});

describe("placement actions", () => {
  it("moves cursor within bounds", () => {
    let state = createInitialGameState(seededRng(3));
    state = moveCursor(state, { row: -1, col: -1 });
    expect(state.cursor).toEqual({ row: 0, col: 0 });
    state = moveCursor(state, { row: 1, col: 2 });
    expect(state.cursor).toEqual({ row: 1, col: 2 });
  });

  it("flips placement orientation", () => {
    let state = createInitialGameState(seededRng(3));
    state = flipPlacementShip(state);
    expect(state.placementShip?.isHorizontal).toBe(false);
  });

  it("places all ships then enters playing with player turn", () => {
    const state = placeAllPlayerShips();
    expect(state.phase).toBe("playing");
    expect(state.turn).toBe("player");
    expect(state.placementShip).toBeNull();
    expect(state.playerFleet.remainingShips).toBe(5);
  });
});

describe("combat turns", () => {
  it("switches to computer turn after a valid player shot", () => {
    let state = placeAllPlayerShips();
    state = fireAsPlayer(state, { row: 9, col: 9 });
    expect(state.phase).toBe("playing");
    expect(state.turn).toBe("computer");
    expect(state.opponentGrid[9][9].isShot).toBe(true);
  });

  it("switches back to player turn after a computer shot", () => {
    let state = placeAllPlayerShips();
    state = fireAsPlayer(state, { row: 9, col: 9 });
    state = fireAsComputer(state, { row: 9, col: 9 });
    expect(state.turn).toBe("player");
    expect(state.playerGrid[9][9].isShot).toBe(true);
  });

  it("announces winner when a fleet is eliminated", () => {
    let state = placeAllPlayerShips();

    const shipCells: { row: number; col: number }[] = [];
    for (let row = 0; row < 10; row += 1) {
      for (let col = 0; col < 10; col += 1) {
        if (state.opponentOccupancy[row][col]) {
          shipCells.push({ row, col });
        }
      }
    }

    for (const coord of shipCells) {
      if (state.phase === "finished") break;
      if (state.turn === "computer") {
        // Miss on empty water so we do not sink the player fleet first
        outer: for (let r = 0; r < 10; r += 1) {
          for (let c = 0; c < 10; c += 1) {
            if (
              !state.playerOccupancy[r][c] &&
              !state.playerGrid[r][c].isShot
            ) {
              state = fireAsComputer(state, { row: r, col: c });
              break outer;
            }
          }
        }
      }
      if (state.phase === "finished") break;
      state = fireAsPlayer(state, coord);
    }

    expect(state.phase).toBe("finished");
    expect(state.winner).toBe("player");
    expect(
      state.announcements.some(
        (a) => a.kind === "winner" && a.winner === "player",
      ),
    ).toBe(true);
    expect(
      state.announcements.some(
        (a) => a.kind === "sunk" && a.owner === "opponent",
      ),
    ).toBe(true);
  });

  it("records a miss, a live hit, and a sunk patrol boat on the computer's board", () => {
    let state = placeAllPlayerShips();
    state = fireAsPlayer(state, { row: 9, col: 9 });
    state = fireAsComputer(state, { row: 9, col: 9 });
    expect(state.computerKnowledge[9][9]).toBe("miss");

    state = fireAsPlayer(state, { row: 8, col: 8 });
    state = fireAsComputer(state, { row: 4, col: 0 });
    expect(state.computerKnowledge[4][0]).toBe("hit");

    state = fireAsPlayer(state, { row: 8, col: 7 });
    state = fireAsComputer(state, { row: 0, col: 0 });
    expect(state.computerKnowledge[0][0]).toBe("hit");

    state = fireAsPlayer(state, { row: 8, col: 6 });
    state = fireAsComputer(state, { row: 4, col: 1 });
    expect(state.computerKnowledge[4][0]).toBe("sunk");
    expect(state.computerKnowledge[4][1]).toBe("sunk");
    expect(state.computerKnowledge[0][0]).toBe("hit");
  });
});

describe("takeComputerTurn", () => {
  it("fires the cell the chooser picks and hands the turn back", () => {
    let state = placeAllPlayerShips();
    state = fireAsPlayer(state, { row: 9, col: 9 });
    const rng = () => 0;
    const expected = chooseComputerShot(state.computerKnowledge, rng);

    state = takeComputerTurn(state, rng);

    expect(state.playerGrid[expected.row][expected.col].isShot).toBe(true);
    expect(state.computerKnowledge[expected.row][expected.col]).not.toBe(
      "unknown",
    );
    expect(state.turn).toBe("player");
  });

  it("does nothing when it is not the computer's turn", () => {
    const state = placeAllPlayerShips();
    expect(takeComputerTurn(state, () => 0)).toBe(state);
  });
});
