import type { TimeStep, RealOptionFactors } from '../types';

/**
 * Converts a TimeStep enum to a fractional year value (dt).
 */
export function getTimeStepDt(timeStep: TimeStep): number {
  switch (timeStep) {
    case 'Monthly':
      return 1 / 12;
    case 'Bi-Monthly':
      return 1 / 6;
    case 'Quarterly':
      return 1 / 4;
    case 'Half-Yearly':
      return 1 / 2;
    case 'Yearly':
      return 1;
  }
}

/**
 * Calculates the binomial lattice factors used in Real Options Valuation.
 *
 * @param volatility - Annual volatility (sigma)
 * @param riskFreeRate - Annual risk-free rate
 * @param timeStep - The time step granularity
 * @param optionExercise - Total option exercise period in years
 */
export function calculateRealOptionFactors(
  volatility: number,
  riskFreeRate: number,
  timeStep: TimeStep,
  optionExercise: number,
): RealOptionFactors {
  const dt = getTimeStepDt(timeStep);
  const intervals = Math.round(optionExercise / dt);
  const intervalRiskFreeRate = riskFreeRate * dt;
  const discountFactor = Math.exp(riskFreeRate * dt);
  const discreteDiscountFactor = 1 + riskFreeRate * dt;
  const u = Math.exp(volatility * Math.sqrt(dt));
  const d = 1 / u;
  const pu = (discountFactor - d) / (u - d);
  const pd = 1 - pu;

  return { dt, intervals, intervalRiskFreeRate, discountFactor, discreteDiscountFactor, u, d, pu, pd };
}

/**
 * Builds the forward (asset) binomial tree.
 *
 * Returns a 2-D array where `tree[t][j]` represents the asset value at
 * time step `t` and down-move index `j`.
 *
 *   tree[t][j] = v0 * u^(t - j) * d^j
 *
 * `t` ranges from 0 to factors.intervals (inclusive).
 * `j` ranges from 0 to t (inclusive).
 */
export function buildForwardTree(v0: number, factors: RealOptionFactors): number[][] {
  const { intervals, u, d } = factors;
  const tree: number[][] = [];

  for (let t = 0; t <= intervals; t++) {
    const row: number[] = [];
    for (let j = 0; j <= t; j++) {
      row.push(v0 * Math.pow(u, t - j) * Math.pow(d, j));
    }
    tree.push(row);
  }

  return tree;
}
