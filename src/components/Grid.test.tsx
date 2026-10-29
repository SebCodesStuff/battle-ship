import { render, screen } from "@testing-library/react";
import type { IGrid, IOccupancy, IPlacementShip } from "../types";
import { createEmptyGrid, createEmptyOccupancy } from "../utilities/grid/createEmptyGrid";
import { Grid } from "./Grid";

function carrierOccupancy(): IOccupancy {
  const occupancy = createEmptyOccupancy();
  for (let col = 0; col < 5; col += 1) {
    occupancy[1][col] = "carrier";
  }
  return occupancy;
}

function gridFor(occupancy: IOccupancy): IGrid {
  const grid = createEmptyGrid();
  occupancy.forEach((row, rowIndex) => {
    row.forEach((name, colIndex) => {
      if (name) grid[rowIndex][colIndex].hasShip = true;
    });
  });
  return grid;
}

const battleshipPreview: IPlacementShip = {
  name: "battleship",
  isHorizontal: false,
  length: 4,
};

function hulls(container: HTMLElement): HTMLImageElement[] {
  return [...container.querySelectorAll("img")];
}

describe("Grid hulls", () => {
  it("renders a hull for each placed ship and does not highlight ship cells", () => {
    const occupancy = carrierOccupancy();
    const { container } = render(
      <Grid
        label="Your fleet"
        grid={gridFor(occupancy)}
        mode="player"
        interactive
        occupancy={occupancy}
        onCellActivate={() => undefined}
      />,
    );

    const images = hulls(container);
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute("alt", "");
    expect(images[0]).toHaveAttribute("data-ship", "carrier");
    expect(images[0]).toHaveClass("ship-hull", "ship-hull--horizontal");
    expect(images[0]).not.toHaveClass("ship-hull--preview");

    const shipCell = screen.getByRole("gridcell", {
      name: /row 2 column 1, ship/i,
    });
    expect(shipCell).not.toHaveClass("cell--ship");
  });

  it("renders placed hulls on the opponent grid", () => {
    const occupancy = carrierOccupancy();
    const { container } = render(
      <Grid
        label="Opponent"
        grid={gridFor(occupancy)}
        mode="opponent"
        interactive
        occupancy={occupancy}
        placementShip={battleshipPreview}
        cursor={{ row: 0, col: 0 }}
        onCellActivate={() => undefined}
      />,
    );

    const images = hulls(container);
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute("data-ship", "carrier");
    expect(images[0]).not.toHaveClass("ship-hull--preview");
  });

  it("renders the placement preview only on the player grid", () => {
    const occupancy = carrierOccupancy();
    const { container } = render(
      <Grid
        label="Your fleet"
        grid={gridFor(occupancy)}
        mode="player"
        interactive
        occupancy={occupancy}
        placementShip={battleshipPreview}
        cursor={{ row: 3, col: 4 }}
        onCellActivate={() => undefined}
      />,
    );

    const images = hulls(container);
    expect(images).toHaveLength(2);
    const preview = images.find((image) =>
      image.classList.contains("ship-hull--preview"),
    );
    expect(preview).toHaveAttribute("data-ship", "battleship");
    expect(preview).toHaveClass("ship-hull--vertical");
    expect(preview).toHaveAttribute("alt", "");
  });

  it("keeps hit styling on shot ship cells", () => {
    const occupancy = carrierOccupancy();
    const grid = gridFor(occupancy);
    grid[1][0].isShot = true;

    render(
      <Grid
        label="Your fleet"
        grid={grid}
        mode="player"
        interactive={false}
        occupancy={occupancy}
        onCellActivate={() => undefined}
      />,
    );

    const hitCell = screen.getByRole("gridcell", {
      name: /row 2 column 1, hit/i,
    });
    expect(hitCell).toHaveClass("cell--hit");
    expect(hitCell).not.toHaveClass("cell--ship");
  });
});
