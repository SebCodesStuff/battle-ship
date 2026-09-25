export type IShipName =
  | "carrier"
  | "battleship"
  | "destroyer"
  | "submarine"
  | "patrol boat";

export type IShipDefinition = {
  name: IShipName;
  length: number;
};

export type IPlacementShip = {
  name: IShipName;
  isHorizontal: boolean;
  length: number;
};
