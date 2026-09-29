/**
 * Tiny explicit finite-difference simulation of a reversible (Nernstian)
 * one-electron CV at a planar electrode, R -> O + e-, equal diffusion
 * coefficients. Returns E (V vs E0') and dimensionless current, oxidation
 * positive. Good enough to draw the textbook "duck" with ΔEp ≈ 57 mV.
 */
export function simulateCV({
  eStart = -0.3,
  eSwitch = 0.35,
  points = 1600,
}: { eStart?: number; eSwitch?: number; points?: number } = {}): [number, number][] {
  const f = 96485 / (8.314 * 298.15);
  const D = 1e-5; // cm2/s
  const v = 0.1; // V/s
  const span = eSwitch - eStart;
  const tTotal = (2 * span) / v;
  const steps = points;
  const dt = tTotal / steps;
  const lambda = 0.45;
  const dx = Math.sqrt((D * dt) / lambda);
  const n = Math.ceil((6 * Math.sqrt(D * tTotal)) / dx) + 2;

  let cR = new Float64Array(n).fill(1);
  let next = new Float64Array(n);
  const out: [number, number][] = [];

  for (let k = 1; k <= steps; k++) {
    const t = k * dt;
    const E = t <= tTotal / 2 ? eStart + v * t : eSwitch - v * (t - tTotal / 2);
    for (let i = 1; i < n - 1; i++) next[i] = cR[i] + lambda * (cR[i + 1] - 2 * cR[i] + cR[i - 1]);
    next[n - 1] = 1;
    // Nernst at the surface with cO + cR = 1: cO/cR = exp(f E)
    next[0] = 1 / (1 + Math.exp(f * E));
    [cR, next] = [next, cR];
    const flux = (cR[1] - cR[0]) / dx; // oxidation consumes R at the surface
    out.push([E, flux]);
  }

  const peak = Math.max(...out.map((p) => p[1]));
  return out.map(([e, i]) => [e, i / peak]);
}

/** Butler–Volmer current density (A/cm2) for overpotential eta (V). */
export function butlerVolmer(eta: number, j0: number, beta: number, n = 1) {
  const f = (n * 96485) / (8.314 * 298.15);
  return j0 * (Math.exp((1 - beta) * f * eta) - Math.exp(-beta * f * eta));
}
