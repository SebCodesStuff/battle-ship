import type { ICoord, IKnownCell, IShipName } from "../../types";
import { GRID_SIZE } from "../grid/createEmptyGrid";
import type { IRng } from "../placement/randomFleet";
import { FLEET } from "../ships/fleet";

export type { IKnownCell };

export function createEmptyKnowledge(): IKnownCell[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => "unknown" as const),
  );
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
}

function pick(candidates: ICoord[], rng: IRng): ICoord {
  const index = Math.floor(rng() * candidates.length);
  return candidates[index];
}

function huntCells(knowledge: IKnownCell[][], evenParityOnly: boolean): ICoord[] {
  const cells: ICoord[] = [];
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (knowledge[row][col] !== "unknown") continue;
      if (evenParityOnly && (row + col) % 2 !== 0) continue;
      cells.push({ row, col });
    }
  }
  return cells;
}

function targetCandidates(knowledge: IKnownCell[][], hits: ICoord[]): ICoord[] {
  const hitKeys = new Set(hits.map((hit) => `${hit.row},${hit.col}`));
  const chosen = new Map<string, ICoord>();
  const aligned = new Set<string>();

  function add(row: number, col: number) {
    if (!inBounds(row, col) || knowledge[row][col] !== "unknown") return;
    chosen.set(`${row},${col}`, { row, col });
  }

  const byRow = new Map<number, number[]>();
  const byCol = new Map<number, number[]>();
  for (const hit of hits) {
    const cols = byRow.get(hit.row) ?? [];
    cols.push(hit.col);
    byRow.set(hit.row, cols);
    const rows = byCol.get(hit.col) ?? [];
    rows.push(hit.row);
    byCol.set(hit.col, rows);
  }

  for (const [row, cols] of byRow) {
    if (cols.length < 2) continue;
    for (const col of cols) aligned.add(`${row},${col}`);
    const min = Math.min(...cols);
    const max = Math.max(...cols);
    add(row, min - 1);
    add(row, max + 1);
    for (let col = min + 1; col < max; col += 1) {
      if (!hitKeys.has(`${row},${col}`)) add(row, col);
    }
  }

  for (const [col, rows] of byCol) {
    if (rows.length < 2) continue;
    for (const row of rows) aligned.add(`${row},${col}`);
    const min = Math.min(...rows);
    const max = Math.max(...rows);
    add(min - 1, col);
    add(max + 1, col);
    for (let row = min + 1; row < max; row += 1) {
      if (!hitKeys.has(`${row},${col}`)) add(row, col);
    }
  }

  for (const hit of hits) {
    if (aligned.has(`${hit.row},${hit.col}`)) continue;
    add(hit.row - 1, hit.col);
    add(hit.row + 1, hit.col);
    add(hit.row, hit.col - 1);
    add(hit.row, hit.col + 1);
  }

  return [...chosen.values()].sort((a, b) => a.row - b.row || a.col - b.col);
}

export function chooseComputerShot(
  knowledge: IKnownCell[][],
  rng: IRng,
): ICoord {
  const hits: ICoord[] = [];
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (knowledge[row][col] === "hit") hits.push({ row, col });
    }
  }

  if (hits.length > 0) {
    const targets = targetCandidates(knowledge, hits);
    if (targets.length > 0) return pick(targets, rng);
  }

  const parity = huntCells(knowledge, true);
  if (parity.length > 0) return pick(parity, rng);

  const remaining = huntCells(knowledge, false);
  if (remaining.length === 0) {
    throw new Error("No unknown cells left to shoot");
  }
  return pick(remaining, rng);
}

function lineThrough(
  knowledge: IKnownCell[][],
  origin: ICoord,
  deltaRow: number,
  deltaCol: number,
): ICoord[] {
  const behind: ICoord[] = [];
  let row = origin.row - deltaRow;
  let col = origin.col - deltaCol;
  while (inBounds(row, col) && knowledge[row][col] === "hit") {
    behind.push({ row, col });
    row -= deltaRow;
    col -= deltaCol;
  }
  behind.reverse();

  const ahead: ICoord[] = [];
  row = origin.row + deltaRow;
  col = origin.col + deltaCol;
  while (inBounds(row, col) && knowledge[row][col] === "hit") {
    ahead.push({ row, col });
    row += deltaRow;
    col += deltaCol;
  }

  return [...behind, origin, ...ahead];
}

function windowIncluding(
  line: ICoord[],
  origin: ICoord,
  length: number,
): ICoord[] | null {
  if (line.length < length) return null;
  const originIndex = line.findIndex(
    (cell) => cell.row === origin.row && cell.col === origin.col,
  );
  for (let start = 0; start <= line.length - length; start += 1) {
    const end = start + length - 1;
    if (originIndex >= start && originIndex <= end) {
      return line.slice(start, start + length);
    }
  }
  return null;
}

function sunkCells(
  knowledge: IKnownCell[][],
  origin: ICoord,
  shipName: IShipName,
): ICoord[] {
  const length = FLEET.find((ship) => ship.name === shipName)?.length;
  if (!length) return [origin];

  const horizontal = lineThrough(knowledge, origin, 0, 1);
  const vertical = lineThrough(knowledge, origin, 1, 0);
  const horizontalWindow = windowIncluding(horizontal, origin, length);
  const verticalWindow = windowIncluding(vertical, origin, length);

  if (horizontalWindow && horizontal.length === length) return horizontalWindow;
  if (verticalWindow && vertical.length === length) return verticalWindow;
  if (horizontalWindow) return horizontalWindow;
  if (verticalWindow) return verticalWindow;
  return [origin];
}

export function recordComputerShot(
  knowledge: IKnownCell[][],
  coord: ICoord,
  result: { hit: boolean; sunk: IShipName | null },
): IKnownCell[][] {
  const next = knowledge.map((row) => [...row]);
  if (!result.hit) {
    next[coord.row][coord.col] = "miss";
    return next;
  }

  next[coord.row][coord.col] = "hit";
  if (!result.sunk) return next;

  for (const cell of sunkCells(next, coord, result.sunk)) {
    next[cell.row][cell.col] = "sunk";
  }
  return next;
}
