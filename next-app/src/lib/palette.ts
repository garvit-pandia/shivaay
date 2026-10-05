/** Container-wall palette — shared by the services wall and the hero yard. */
export const TEAL_CYCLE = ["#0F766E", "#134E4A", "#0D9488"] as const;
export const ACCENT_ORANGE = "#EA580C";

/** Corrugated panel palette: teals cycle, every 5th container is orange. */
export function containerColor(index: number): string {
  if ((index + 1) % 5 === 0) return ACCENT_ORANGE;
  return TEAL_CYCLE[index % TEAL_CYCLE.length];
}
