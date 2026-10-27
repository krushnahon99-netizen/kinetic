const CORNERS = [
  "-left-3 -top-3 border-l border-t",
  "-right-3 -top-3 border-r border-t",
  "-bottom-3 -left-3 border-b border-l",
  "-bottom-3 -right-3 border-b border-r",
];

/** Print-style crop marks around the player, echoing the ones inside the reel. */
export function CornerMarks() {
  return CORNERS.map((position) => (
    <span
      key={position}
      aria-hidden="true"
      className={`pointer-events-none absolute size-4 border-bone/40 ${position}`}
    />
  ));
}
