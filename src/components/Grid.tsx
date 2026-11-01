import type { CSSProperties } from "react";
import { SHIP_HULLS } from "../assets/shipHulls";
import type {
  ICoord,
  IGrid,
  IOccupancy,
  IPlacementShip,
  IShipName,
} from "../types";
import { canPlaceShip, getShipCells } from "../utilities/placement/placement";
import { listPlacedShips } from "../utilities/ships/placedShips";

type IGridMode = "player" | "opponent";

type IGridProps = {
  label: string;
  grid: IGrid;
  mode: IGridMode;
  interactive: boolean;
  occupancy: IOccupancy;
  sunkShips?: readonly IShipName[];
  cursor?: ICoord;
  placementShip?: IPlacementShip | null;
  onCellActivate: (coord: ICoord) => void;
  onCursorMove?: (coord: ICoord) => void;
};

function cellLabel(
  mode: IGridMode,
  cell: IGrid[number][number],
  row: number,
  col: number,
): string {
  if (!cell.isShot) {
    if (mode === "player" && cell.hasShip) {
      return `row ${row + 1} column ${col + 1}, ship`;
    }
    return `row ${row + 1} column ${col + 1}, empty`;
  }
  if (cell.hasShip) {
    return `row ${row + 1} column ${col + 1}, hit`;
  }
  return `row ${row + 1} column ${col + 1}, miss`;
}

function cellClassName(
  cell: IGrid[number][number],
  isPreview: boolean,
  previewValid: boolean | null,
): string {
  const classes = ["cell"];
  if (cell.isShot && cell.hasShip) classes.push("cell--hit");
  else if (cell.isShot) classes.push("cell--miss");

  if (isPreview) {
    classes.push(previewValid ? "cell--preview-valid" : "cell--preview-invalid");
  }
  return classes.join(" ");
}

function hullStyle(head: ICoord, length: number): CSSProperties {
  return {
    "--ship-row": head.row,
    "--ship-col": head.col,
    "--ship-length": length,
  } as CSSProperties;
}

function HullImage({
  name,
  isHorizontal,
  head,
  length,
  preview = false,
}: {
  name: IShipName;
  isHorizontal: boolean;
  head: ICoord;
  length: number;
  preview?: boolean;
}) {
  const classes = [
    "ship-hull",
    isHorizontal ? "ship-hull--horizontal" : "ship-hull--vertical",
  ];
  if (isHorizontal) classes.push("ship-hull--rotated");
  if (preview) classes.push("ship-hull--preview");
  else classes.push("ship-hull--reveal");

  return (
    <img
      className={classes.join(" ")}
      src={SHIP_HULLS[name]}
      alt=""
      data-ship={name}
      style={hullStyle(head, length)}
    />
  );
}

export function Grid({
  label,
  grid,
  mode,
  interactive,
  occupancy,
  sunkShips = [],
  cursor,
  placementShip,
  onCellActivate,
  onCursorMove,
}: IGridProps) {
  const previewCells =
    mode === "player" && placementShip && cursor
      ? getShipCells(cursor, placementShip)
      : [];
  const previewValid =
    mode === "player" && placementShip && cursor
      ? canPlaceShip(grid, cursor, placementShip)
      : null;
  const previewKey = new Set(previewCells.map((c) => `${c.row},${c.col}`));
  const placedShips = listPlacedShips(occupancy).filter(
    (ship) => mode === "player" || sunkShips.includes(ship.name),
  );
  const showPreview = mode === "player" && placementShip && cursor;

  return (
    <section className="board" aria-label={label}>
      <h2>{label}</h2>
      <div className="board__grid" role="grid" aria-label={`${label} cells`}>
        {grid.map((row, rowIndex) => (
          <div className="board__row" role="row" key={rowIndex}>
            {row.map((cell, colIndex) => {
              const coord = { row: rowIndex, col: colIndex };
              const isPreview = previewKey.has(`${rowIndex},${colIndex}`);
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  type="button"
                  role="gridcell"
                  className={cellClassName(cell, isPreview, previewValid)}
                  aria-label={cellLabel(mode, cell, rowIndex, colIndex)}
                  disabled={!interactive || cell.isShot}
                  onFocus={() => onCursorMove?.(coord)}
                  onMouseEnter={() => onCursorMove?.(coord)}
                  onClick={() => onCellActivate(coord)}
                />
              );
            })}
          </div>
        ))}
        {placedShips.map((ship) => (
          <HullImage
            key={ship.name}
            name={ship.name}
            isHorizontal={ship.isHorizontal}
            head={ship.head}
            length={ship.length}
          />
        ))}
        {showPreview ? (
          <HullImage
            name={placementShip.name}
            isHorizontal={placementShip.isHorizontal}
            head={cursor}
            length={placementShip.length}
            preview
          />
        ) : null}
      </div>
    </section>
  );
}
