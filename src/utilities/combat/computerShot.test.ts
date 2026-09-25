import { GRID_SIZE } from "../grid/createEmptyGrid";
import {
  chooseComputerShot,
  createEmptyKnowledge,
  recordComputerShot,
  type IKnownCell,
} from "./computerShot";

function seededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function knowledgeWith(
  cells: { row: number; col: number; value: IKnownCell }[],
): IKnownCell[][] {
  const board = createEmptyKnowledge();
  for (const cell of cells) {
    board[cell.row][cell.col] = cell.value;
  }
  return board;
}

describe("chooseComputerShot", () => {
  it("hunts an even-parity unknown cell when nothing has been hit", () => {
    const shot = chooseComputerShot(createEmptyKnowledge(), seededRng(1));
    expect((shot.row + shot.col) % 2).toBe(0);
    expect(shot.row).toBeGreaterThanOrEqual(0);
    expect(shot.row).toBeLessThan(GRID_SIZE);
    expect(shot.col).toBeGreaterThanOrEqual(0);
    expect(shot.col).toBeLessThan(GRID_SIZE);
  });

  it("does not shoot a cell the computer already knows", () => {
    const knowledge = createEmptyKnowledge();
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        if ((row + col) % 2 === 0 && !(row === 0 && col === 0)) {
          knowledge[row][col] = "miss";
        }
      }
    }

    expect(chooseComputerShot(knowledge, seededRng(1))).toEqual({
      row: 0,
      col: 0,
    });
  });

  it("hunts any unknown cell once even parity is exhausted", () => {
    const knowledge = createEmptyKnowledge();
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        if ((row + col) % 2 === 0) knowledge[row][col] = "miss";
      }
    }

    const shot = chooseComputerShot(knowledge, seededRng(1));
    expect((shot.row + shot.col) % 2).toBe(1);
    expect(knowledge[shot.row][shot.col]).toBe("unknown");
  });

  it("targets an orthogonal neighbor of a single hit", () => {
    const knowledge = knowledgeWith([{ row: 4, col: 4, value: "hit" }]);
    const shot = chooseComputerShot(knowledge, seededRng(1));
    expect([
      { row: 3, col: 4 },
      { row: 5, col: 4 },
      { row: 4, col: 3 },
      { row: 4, col: 5 },
    ]).toContainEqual(shot);
  });

  it("stays on the board when the hit is in a corner", () => {
    const knowledge = knowledgeWith([{ row: 0, col: 0, value: "hit" }]);
    const shot = chooseComputerShot(knowledge, seededRng(2));
    expect([
      { row: 1, col: 0 },
      { row: 0, col: 1 },
    ]).toContainEqual(shot);
  });

  it("extends a line of hits instead of shooting beside it", () => {
    const knowledge = knowledgeWith([
      { row: 4, col: 4, value: "hit" },
      { row: 4, col: 5, value: "hit" },
    ]);
    const shot = chooseComputerShot(knowledge, seededRng(1));
    expect([
      { row: 4, col: 3 },
      { row: 4, col: 6 },
    ]).toContainEqual(shot);
  });

  it("extends a vertical line the same way", () => {
    const knowledge = knowledgeWith([
      { row: 4, col: 4, value: "hit" },
      { row: 5, col: 4, value: "hit" },
    ]);
    const shot = chooseComputerShot(knowledge, seededRng(1));
    expect([
      { row: 3, col: 4 },
      { row: 6, col: 4 },
    ]).toContainEqual(shot);
  });

  it("returns to parity hunt after those hits are marked sunk", () => {
    const knowledge = knowledgeWith([
      { row: 4, col: 4, value: "sunk" },
      { row: 4, col: 5, value: "sunk" },
    ]);
    const shot = chooseComputerShot(knowledge, seededRng(1));
    expect((shot.row + shot.col) % 2).toBe(0);
    expect(knowledge[shot.row][shot.col]).toBe("unknown");
  });

  it("picks the same cell for the same seed", () => {
    const first = chooseComputerShot(createEmptyKnowledge(), seededRng(7));
    const second = chooseComputerShot(createEmptyKnowledge(), seededRng(7));
    expect(first).toEqual(second);
  });
});

describe("recordComputerShot", () => {
  it("records a miss", () => {
    const next = recordComputerShot(
      createEmptyKnowledge(),
      { row: 1, col: 1 },
      { hit: false, sunk: null },
    );
    expect(next[1][1]).toBe("miss");
  });

  it("records a hit that does not sink the ship", () => {
    const next = recordComputerShot(
      createEmptyKnowledge(),
      { row: 2, col: 3 },
      { hit: true, sunk: null },
    );
    expect(next[2][3]).toBe("hit");
  });

  it("marks the sunk run and leaves a separate hit active", () => {
    let knowledge = recordComputerShot(
      createEmptyKnowledge(),
      { row: 0, col: 0 },
      { hit: true, sunk: null },
    );
    knowledge = recordComputerShot(knowledge, { row: 5, col: 5 }, {
      hit: true,
      sunk: null,
    });
    knowledge = recordComputerShot(knowledge, { row: 0, col: 1 }, {
      hit: true,
      sunk: "patrol boat",
    });

    expect(knowledge[0][0]).toBe("sunk");
    expect(knowledge[0][1]).toBe("sunk");
    expect(knowledge[5][5]).toBe("hit");
  });

  it("retires only the sunk length when a longer hit run touches the ship", () => {
    let knowledge = recordComputerShot(
      createEmptyKnowledge(),
      { row: 0, col: 0 },
      { hit: true, sunk: null },
    );
    knowledge = recordComputerShot(knowledge, { row: 0, col: 2 }, {
      hit: true,
      sunk: null,
    });
    knowledge = recordComputerShot(knowledge, { row: 0, col: 1 }, {
      hit: true,
      sunk: "patrol boat",
    });

    expect(knowledge[0][0]).toBe("sunk");
    expect(knowledge[0][1]).toBe("sunk");
    expect(knowledge[0][2]).toBe("hit");
  });
});
