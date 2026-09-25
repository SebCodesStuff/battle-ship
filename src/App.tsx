import { useEffect, useState } from "react";
import { Grid } from "./components/Grid";
import { PlacementControls } from "./components/PlacementControls";
import { StatusBar } from "./components/StatusBar";
import type { ICoord, IGameState } from "./types";
import {
  createInitialGameState,
  fireAsComputer,
  fireAsPlayer,
  flipPlacementShip,
  moveCursor,
  placeCurrentShip,
  setCursor,
} from "./utilities/gameState/gameState";
import "./App.css";

function turnText(state: IGameState): string {
  if (state.phase === "placing") {
    return "Place your ships. Use arrow keys to move, Enter to place, Flip to rotate.";
  }
  if (state.phase === "finished") {
    return state.winner === "player"
      ? "Game over — Player wins!"
      : "Game over — Opponent wins!";
  }
  return state.turn === "player"
    ? "Your turn — fire on the opponent grid."
    : "Computer turn — fire on your grid (playing as the computer).";
}

export default function App() {
  const [state, setState] = useState<IGameState>(() => createInitialGameState());

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (state.phase === "placing") {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setState((s) => moveCursor(s, { row: -1, col: 0 }));
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          setState((s) => moveCursor(s, { row: 1, col: 0 }));
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          setState((s) => moveCursor(s, { row: 0, col: -1 }));
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          setState((s) => moveCursor(s, { row: 0, col: 1 }));
        } else if (event.key === "Enter") {
          event.preventDefault();
          setState((s) => placeCurrentShip(s));
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.phase]);

  const playerInteractive =
    state.phase === "placing" ||
    (state.phase === "playing" && state.turn === "computer");
  const opponentInteractive =
    state.phase === "playing" && state.turn === "player";

  function handlePlayerCell(coord: ICoord) {
    setState((s) => {
      if (s.phase === "placing") {
        let next = setCursor(s, coord);
        next = placeCurrentShip(next);
        return next;
      }
      if (s.phase === "playing" && s.turn === "computer") {
        return fireAsComputer(s, coord);
      }
      return s;
    });
  }

  function handleOpponentCell(coord: ICoord) {
    setState((s) => {
      if (s.phase === "playing" && s.turn === "player") {
        return fireAsPlayer(s, coord);
      }
      return s;
    });
  }

  return (
    <main className="app">
      <h1 className="app__title">Battleship</h1>
      {state.placementShip ? (
        <PlacementControls
          ship={state.placementShip}
          onFlip={() => setState((s) => flipPlacementShip(s))}
        />
      ) : null}
      <div className="app__boards">
        <Grid
          label="Your fleet"
          grid={state.playerGrid}
          mode="player"
          interactive={playerInteractive}
          cursor={state.phase === "placing" ? state.cursor : undefined}
          placementShip={state.placementShip}
          onCursorMove={(coord) => {
            if (state.phase === "placing") {
              setState((s) => setCursor(s, coord));
            }
          }}
          onCellActivate={handlePlayerCell}
        />
        <Grid
          label="Opponent"
          grid={state.opponentGrid}
          mode="opponent"
          interactive={opponentInteractive}
          onCellActivate={handleOpponentCell}
        />
      </div>
      <StatusBar
        announcements={state.announcements}
        turnText={turnText(state)}
      />
    </main>
  );
}
