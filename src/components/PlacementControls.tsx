import type { IPlacementShip } from "../types";

type IPlacementControlsProps = {
  ship: IPlacementShip;
  onFlip: () => void;
};

export function PlacementControls({
  ship,
  onFlip,
}: IPlacementControlsProps) {
  return (
    <div className="placement-controls">
      <p>
        Placing <strong>{ship.name}</strong> (length {ship.length}) —{" "}
        {ship.isHorizontal ? "horizontal" : "vertical"}
      </p>
      <button type="button" onClick={onFlip}>
        Flip
      </button>
    </div>
  );
}
