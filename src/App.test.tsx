import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

function seededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

beforeEach(() => {
  const rng = seededRng(99);
  jest.spyOn(Math, "random").mockImplementation(rng);
});

afterEach(() => {
  jest.restoreAllMocks();
});

async function placeAllShips(user: ReturnType<typeof userEvent.setup>) {
  const playerBoard = screen.getByRole("region", { name: /your fleet/i });
  for (let row = 0; row < 5; row += 1) {
    const cell = within(playerBoard).getByRole("gridcell", {
      name: new RegExp(`^row ${row + 1} column 1,`, "i"),
    });
    await user.click(cell);
  }
}

describe("App", () => {
  it("renders the Battleship heading and both grids", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /battleship/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /your fleet/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /opponent/i }),
    ).toBeInTheDocument();
  });

  it("flips the ship during placement", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/horizontal/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /flip/i }));
    expect(screen.getByText(/vertical/i)).toBeInTheDocument();
  });

  it("starts the game after placing all ships and allows firing turns", async () => {
    const user = userEvent.setup();
    render(<App />);

    await placeAllShips(user);

    expect(
      screen.getByText(/your turn — fire on the opponent grid/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /flip/i }),
    ).not.toBeInTheDocument();

    const opponentBoard = screen.getByRole("region", { name: /opponent/i });
    const target = within(opponentBoard).getByRole("gridcell", {
      name: /^row 1 column 1,/i,
    });
    await user.click(target);

    expect(
      screen.getByText(/computer turn — fire on your grid/i),
    ).toBeInTheDocument();

    const playerBoard = screen.getByRole("region", { name: /your fleet/i });
    const reply = within(playerBoard).getByRole("gridcell", {
      name: /^row 10 column 10,/i,
    });
    await user.click(reply);

    expect(
      screen.getByText(/your turn — fire on the opponent grid/i),
    ).toBeInTheDocument();
  });
});
