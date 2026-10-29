import type { ICoord, IOccupancy, IShipName } from "../../types";

export type IPlacedShip = {
  name: IShipName;
  isHorizontal: boolean;
  head: ICoord;
  length: number;
};

export function listPlacedShips(occupancy: IOccupancy): IPlacedShip[] {
  const cellsByName = new Map<IShipName, ICoord[]>();

  occupancy.forEach((row, rowIndex) => {
    row.forEach((name, colIndex) => {
      if (!name) return;
      const cells = cellsByName.get(name) ?? [];
      cells.push({ row: rowIndex, col: colIndex });
      cellsByName.set(name, cells);
    });
  });

  return [...cellsByName.entries()].map(([name, cells]) => {
    const rows = new Set(cells.map((cell) => cell.row));
    const isHorizontal = rows.size === 1;
    const head = cells.reduce((bow, cell) => {
      if (isHorizontal) return cell.col < bow.col ? cell : bow;
      return cell.row < bow.row ? cell : bow;
    });

    return {
      name,
      isHorizontal,
      head,
      length: cells.length,
    };
  });
}
