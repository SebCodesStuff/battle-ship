import { useEffect, useState } from "react";
import { Grid } from "./components/Grid";
import { PlacementControls } from "./components/PlacementControls";
import { StatusBar } from "./components/StatusBar";
import type { ICoord, IGameState } from "./types";
import {
  createInitialGameState,
  fireAsPlayer,
  flipPlacementShip,
  moveCursor,
  placeCurrentShip,
  setCursor,
  takeComputerTurn,
} from "./utilities/gameState/gameState";
import "./App.css";

const COMPUTER_THINK_MS = 1000;

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
    : "Computer is thinking…";
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

  useEffect(() => {
    if (state.phase !== "playing" || state.turn !== "computer") return;
    const timeoutId = window.setTimeout(() => {
      setState((current) => takeComputerTurn(current));
    }, COMPUTER_THINK_MS);
    return () => window.clearTimeout(timeoutId);
  }, [state.phase, state.turn]);

  const playerInteractive = state.phase === "placing";
  const opponentInteractive =
    state.phase === "playing" && state.turn === "player";

  function handlePlayerCell(coord: ICoord) {
    setState((s) => {
      if (s.phase === "placing") {
        let next = setCursor(s, coord);
        next = placeCurrentShip(next);
        return next;
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
