export interface HeroBridge {
  /** Screen-space position of a named agent (for tests + tooling). */
  getAgentScreenPosition: (id: string) => { x: number; y: number } | null;
}

export const heroBridge: HeroBridge = {
  getAgentScreenPosition: () => null,
};
