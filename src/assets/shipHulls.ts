import type { IShipName } from "../types";
import battleship from "./ShipBattleshipHull.png";
import carrier from "./ShipCarrierHull.png";
import destroyer from "./ShipDestroyerHull.png";
import patrol from "./ShipPatrolHull.png";
import submarine from "./ShipSubMarineHull.png";

export const SHIP_HULLS: Record<IShipName, string> = {
  carrier,
  battleship,
  destroyer,
  submarine,
  "patrol boat": patrol,
};
