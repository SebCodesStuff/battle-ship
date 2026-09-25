import type { IAnnouncement } from "../types";

type IStatusProps = {
  announcements: IAnnouncement[];
  turnText: string;
};

function formatAnnouncement(a: IAnnouncement): string {
  if (a.kind === "sunk") {
    const owner = a.owner === "player" ? "Player" : "Opponent";
    return `${owner}'s ${a.shipName} sunk`;
  }
  const winner = a.winner === "player" ? "Player" : "Opponent";
  return `${winner} wins!`;
}

export function StatusBar({ announcements, turnText }: IStatusProps) {
  return (
    <footer className="status" aria-live="polite">
      <p className="status__turn">{turnText}</p>
      <ul className="status__announcements">
        {announcements.map((a, index) => (
          <li key={`${a.kind}-${index}`}>{formatAnnouncement(a)}</li>
        ))}
      </ul>
    </footer>
  );
}
