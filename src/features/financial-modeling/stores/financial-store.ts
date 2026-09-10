import { create, type StateCreator, type StoreApi } from "zustand";
import type {
  DCFInputs,
  DCFResult,
  DelayInputs,
  ExpandInputs,
  AbandonInputs,
  VolatilityInputs,
  BinomialLatticeResult,
  DelaySummary,
  ExpandSummary,
  AbandonSummary,
} from '../types';
import { calculateDCF, calculateVolatility } from '../engines/dcf-engine';
import { calculateOptionToDelay } from '../engines/delay-engine';
import { calculateOptionToExpand } from '../engines/expand-engine';
import { calculateOptionToAbandon } from '../engines/abandon-engine';
import type { TimeStep } from '../types';

function isTimeStepValid(timeStep: TimeStep, exercise: number): boolean {
  switch (timeStep) {
    case 'Monthly': return exercise <= 2;
    case 'Bi-Monthly': return exercise <= 4;
    case 'Quarterly': return exercise <= 6;
    case 'Half-Yearly': return exercise <= 12;
    case 'Yearly': return true;
  }
}

function createDefaultYearlyCashFlow(
  totalYears: number,
  defaults?: { capex?: number[]; revenue?: number[]; costOfSales?: number[]; opex?: number[] },
) {
  const fill = (arr: number[], src?: number[]) => {
    if (src) src.forEach((v, i) => { if (i < arr.length) arr[i] = v; });
    return arr;
  };
  return {
    capex: fill(Array(totalYears + 1).fill(0), defaults?.capex),
    revenue: fill(Array(totalYears + 1).fill(0), defaults?.revenue),
    costOfSales: fill(Array(totalYears + 1).fill(0), defaults?.costOfSales),
    opex: fill(Array(totalYears + 1).fill(0), defaults?.opex),
  };
}

const DEFAULT_CAPEX_YEARS = 3;
const DEFAULT_ASSET_LIFE = 17;

/**
 * Calculate DCF safely (returns null on any error).
 * Centralized to avoid repeating try/catch across the store.
 */
function safeCalculateDCF(inputs: DCFInputs): DCFResult | null {
  try {
    return calculateDCF(inputs);
  } catch {
    return null;
  }
}

/**
 * Calculate volatility safely (returns 0 on any error).
 */
function safeCalculateVolatility(inputs: VolatilityInputs): number {
  try {
    return calculateVolatility(inputs);
  } catch {
    return 0;
  }
}

function effectiveDelayAssetLife(delayInputs: DelayInputs, delayDCFInputs: DCFInputs): number {
  return delayInputs.assetSource === 'Use DCF Output'
    ? delayDCFInputs.capitalProfile.assetLife
    : Math.max(1, Math.round(delayInputs.manualAssetLife || 1));
}

function effectiveExpandAssetLife(expandInputs: ExpandInputs, expandExpansionDCFInputs: DCFInputs): number {
  return expandInputs.expansionSource === 'Use DCF Output'
    ? expandExpansionDCFInputs.capitalProfile.assetLife
    : Math.max(1, Math.round(expandInputs.manualExpansionAssetLife || 1));
}

function effectiveAbandonAssetLife(abandonInputs: AbandonInputs, abandonDCFInputs: DCFInputs): number {
  return abandonInputs.assetSource === 'Use DCF Output'
    ? abandonDCFInputs.capitalProfile.assetLife
    : Math.max(1, Math.round(abandonInputs.manualAssetLife || 1));
}

/**
 * Merge Delay DCF into a destination sheet.
 *
 * - `preserve-dst-profile` (Expand): overlay delay on dst so dst-only keys stay
 *   (e.g. hasExtraYear, capexIncludesNonDepreciating) when delay omits them.
 * - `use-delay-profile` (Abandon): use delay’s capital profile only so Asset/CAPEX
 *   Opportunity Cost / Recovery matches the Delay sheet (same year-0 outflow and recovery column).
 */
function copyDelayDCFInto(
  dst: DCFInputs,
  delay: DCFInputs,
  capitalProfileMode: 'preserve-dst-profile' | 'use-delay-profile' = 'preserve-dst-profile',
): DCFInputs {
  const capitalProfile =
    capitalProfileMode === 'use-delay-profile'
      ? { ...delay.capitalProfile }
      : { ...dst.capitalProfile, ...delay.capitalProfile };
  const financialMetrics = { ...dst.financialMetrics, ...delay.financialMetrics };
  const oldColumnCount = delay.yearlyCashFlow.revenue.length;
  const newColumnCount = getDCFColumnCount(capitalProfile, financialMetrics, false);
  return {
    ...dst,
    capitalProfile,
    financialMetrics,
    workingCapital: { ...dst.workingCapital, ...delay.workingCapital },
    yearlyCashFlow: resizeYearlyCashFlow(delay.yearlyCashFlow, oldColumnCount, newColumnCount),
  };
}

export interface FinancialStore {
  // NPV Only (Master - NPV Only sheet)
  npvDCFInputs: DCFInputs;
  npvDCFResult: DCFResult | null;

  // Option to Delay (own DCF)
  delayDCFInputs: DCFInputs;
  delayDCFResult: DCFResult | null;
  delayVolatilityInputs: VolatilityInputs;
  delayCalculatedVolatility: number;
  delayInputs: DelayInputs;
  delayLattice: BinomialLatticeResult | null;
  delaySummary: DelaySummary | null;

  // Option to Expand (Original DCF)
  expandOriginalDCFInputs: DCFInputs;
  expandOriginalDCFResult: DCFResult | null;
  // Option to Expand (Expansion DCF)
  expandExpansionDCFInputs: DCFInputs;
  expandExpansionDCFResult: DCFResult | null;
  expandVolatilityInputs: VolatilityInputs;
  expandCalculatedVolatility: number;
  // Option to Expand ROV
  expandInputs: ExpandInputs;
  expandLattice: BinomialLatticeResult | null;
  expandSummary: ExpandSummary | null;

  // Option to Abandon
  abandonDCFInputs: DCFInputs;
  abandonDCFResult: DCFResult | null;
  abandonVolatilityInputs: VolatilityInputs;
  abandonCalculatedVolatility: number;
  abandonInputs: AbandonInputs;
  abandonLattice: BinomialLatticeResult | null;
  abandonSummary: AbandonSummary | null;

  // Actions – NPV Only DCF
  updateNpvCapitalProfile: (partial: Partial<DCFInputs['capitalProfile']>) => void;
  updateNpvFinancialMetrics: (partial: Partial<DCFInputs['financialMetrics']>) => void;
  updateNpvWorkingCapital: (partial: Partial<DCFInputs['workingCapital']>) => void;
  updateNpvYearlyCashFlow: (field: keyof DCFInputs['yearlyCashFlow'], index: number, value: number) => void;
  recalculateNpvDCF: () => void;

  // Actions – Delay DCF
  updateDelayCapitalProfile: (partial: Partial<DCFInputs['capitalProfile']>) => void;
  updateDelayFinancialMetrics: (partial: Partial<DCFInputs['financialMetrics']>) => void;
  updateDelayWorkingCapital: (partial: Partial<DCFInputs['workingCapital']>) => void;
  updateDelayYearlyCashFlow: (field: keyof DCFInputs['yearlyCashFlow'], index: number, value: number) => void;
  updateDelayVolatilityInputs: (partial: Partial<VolatilityInputs>) => void;
  recalculateDelayDCF: () => void;

  // Actions – Delay ROV
  updateDelayInputs: (partial: Partial<DelayInputs>) => void;
  recalculateDelay: () => void;

  // Actions – Expand Original DCF
  updateExpandOriginalCapitalProfile: (partial: Partial<DCFInputs['capitalProfile']>) => void;
  updateExpandOriginalFinancialMetrics: (partial: Partial<DCFInputs['financialMetrics']>) => void;
  updateExpandOriginalWorkingCapital: (partial: Partial<DCFInputs['workingCapital']>) => void;
  updateExpandOriginalYearlyCashFlow: (field: keyof DCFInputs['yearlyCashFlow'], index: number, value: number) => void;
  recalculateExpandOriginalDCF: () => void;
  // Actions – Expand Expansion DCF
  updateExpandExpansionCapitalProfile: (partial: Partial<DCFInputs['capitalProfile']>) => void;
  updateExpandExpansionFinancialMetrics: (partial: Partial<DCFInputs['financialMetrics']>) => void;
  updateExpandExpansionWorkingCapital: (partial: Partial<DCFInputs['workingCapital']>) => void;
  updateExpandExpansionYearlyCashFlow: (field: keyof DCFInputs['yearlyCashFlow'], index: number, value: number) => void;
  updateExpandVolatilityInputs: (partial: Partial<VolatilityInputs>) => void;
  recalculateExpandExpansionDCF: () => void;
  // Actions – Expand ROV
  updateExpandInputs: (partial: Partial<ExpandInputs>) => void;
  recalculateExpand: () => void;

  // Actions – Abandon DCF
  updateAbandonCapitalProfile: (partial: Partial<DCFInputs['capitalProfile']>) => void;
  updateAbandonFinancialMetrics: (partial: Partial<DCFInputs['financialMetrics']>) => void;
  updateAbandonWorkingCapital: (partial: Partial<DCFInputs['workingCapital']>) => void;
  updateAbandonYearlyCashFlow: (field: keyof DCFInputs['yearlyCashFlow'], index: number, value: number) => void;
  updateAbandonVolatilityInputs: (partial: Partial<VolatilityInputs>) => void;
  recalculateAbandonDCF: () => void;
  // Actions – Abandon ROV
  updateAbandonInputs: (partial: Partial<AbandonInputs>) => void;
  recalculateAbandon: () => void;

  // Actions – Cross-sheet copy
  copyDelayToExpand: (target: 'original' | 'expansion') => void;
  copyDelayToAbandon: () => void;
}

export const financialStoreInitializer: StateCreator<FinancialStore> = (set, get) => ({
  // === NPV Only DCF (Master - NPV Only) ===
  npvDCFInputs: {
    capitalProfile: {
      capexYears: 3,
      assetLife: 15,
      depreciationMethod: 'SLM',
      residualValue: 25,
      nonDepreciatingAsset: 150,
    },
    financialMetrics: {
      financialOutcome: 'Revenue',
      wacc: 0.12,
      reinvestmentRate: 0.12,
      taxRate: 0.40,
      includePerpetGgity: false,
      perpetuityType: 'Growing',
      perpetuityGrowthRate: 0,
    },
    workingCapital: {
      percentCollected: 0.80,
      percentCostPaid: 1.00,
    },
    yearlyCashFlow: createDefaultYearlyCashFlow(3 + 15),
  },
  npvDCFResult: null,

  // === Delay DCF State (own DCF per sheet) ===
  delayDCFInputs: {
    capitalProfile: {
      capexYears: DEFAULT_CAPEX_YEARS,
      assetLife: DEFAULT_ASSET_LIFE,
      depreciationMethod: 'SYD',
      residualValue: 25,
      nonDepreciatingAsset: 150,
    },
    financialMetrics: {
      financialOutcome: 'Revenue',
      wacc: 0.12,
      reinvestmentRate: 0.12,
      taxRate: 0.40,
      includePerpetGgity: false,
      perpetuityType: 'Growing',
      perpetuityGrowthRate: 0,
    },
    workingCapital: {
      percentCollected: 0.80,
      percentCostPaid: 1.00,
    },
    yearlyCashFlow: createDefaultYearlyCashFlow(DEFAULT_CAPEX_YEARS + DEFAULT_ASSET_LIFE),
  },
  delayDCFResult: null,
  delayVolatilityInputs: { base: 1.0, downside: 0.8, upside: 1.5 },
  delayCalculatedVolatility: 0,

  // === Delay ROV State ===
  delayInputs: {
    volatilitySource: 'Enter Value',
    volatilityDropdown: 0.2,
    selectedIndustry: null,
    volatilityEnterValue: 0.225,
    assetSource: 'Use DCF Output',
    includePerpetGgity: false,
    manualV0: 3422,
    manualI: 2875,
    manualAssetLife: DEFAULT_ASSET_LIFE,
    optionExercise: 10,
    timeStep: 'Yearly',
    riskFreeRate: 0.067,
    includeCostOfDelay: true,
    includeFVStrike: false,
  },
  delayLattice: null,
  delaySummary: null,

  // === Expand State ===
  expandOriginalDCFInputs: {
    capitalProfile: {
      capexYears: 1,
      assetLife: 5,
      depreciationMethod: 'SLM',
      residualValue: 10,
      nonDepreciatingAsset: 250,
      // capexIncludesNonDepreciating: true,
      // hasExtraYear: true,
    },
    financialMetrics: {
      financialOutcome: 'Revenue',
      wacc: 0.12,
      reinvestmentRate: 0.09,
      taxRate: 0.40,
      includePerpetGgity: false,
      perpetuityType: 'Growing',
      perpetuityGrowthRate: 0.02,
      reinvestmentRateSource: 'Other',
      reinvestmentRiskFreeRate: 0.05,
      reinvestmentOtherRate: 0.09,
    },
    workingCapital: { percentCollected: 0.80, percentCostPaid: 1.0 },
    yearlyCashFlow: createDefaultYearlyCashFlow(16),
  },
  expandOriginalDCFResult: null,
  expandExpansionDCFInputs: {
    capitalProfile: {
      capexYears: 1,
      assetLife: 5,
      depreciationMethod: 'SLM',
      residualValue: 10,
      nonDepreciatingAsset: 250,
      // capexIncludesNonDepreciating: true,
      // hasExtraYear: true,
    },
    financialMetrics: {
      financialOutcome: 'Revenue',
      wacc: 0.12,
      reinvestmentRate: 0.09,
      taxRate: 0.40,
      includePerpetGgity: false,
      perpetuityType: 'Growing',
      perpetuityGrowthRate: 0.02,
      reinvestmentRateSource: 'Other',
      reinvestmentRiskFreeRate: 0.05,
      reinvestmentOtherRate: 0.09,
    },
    workingCapital: { percentCollected: 0.80, percentCostPaid: 1.0 },
    yearlyCashFlow: createDefaultYearlyCashFlow(7),
  },
  expandExpansionDCFResult: null,
  expandVolatilityInputs: { base: 1.0, downside: 0.8, upside: 1.5 },
  expandCalculatedVolatility: 0,
  expandInputs: {
    volatilitySource: 'Enter Value',
    volatilityDropdown: 0.2,
    selectedIndustry: null,
    volatilityEnterValue: 0.5,
    currentSource: 'Use DCF Output',
    manualV0Current: 200,
    manualICurrent: 235,
    expansionSource: 'Use DCF Output',
    manualV0Expansion: 400,
    manualIExpansion: 450,
    manualExpansionAssetLife: 5,
    includePerpetGgity: false,
    optionExercise: 2,
    timeStep: 'Quarterly',
    riskFreeRate: 0.04,
    includeCostOfDelay: false,
    includeFVStrike: false,
  },
  expandLattice: null,
  expandSummary: null,

  // === Abandon State ===
  abandonDCFInputs: {
    capitalProfile: {
      capexYears: 1,
      assetLife: 7,
      depreciationMethod: 'SLM',
      residualValue: 10,
      nonDepreciatingAsset: 150,
      // Same Opportunity Cost / recovery rules as Delay (no capexIncludesNonDepreciating / hasExtraYear unless user sets them).
    },
    financialMetrics: {
      financialOutcome: 'Revenue',
      wacc: 0.12,
      reinvestmentRate: 0.09,
      taxRate: 0.40,
      includePerpetGgity: false,
      perpetuityType: 'Growing',
      perpetuityGrowthRate: 0.02,
      reinvestmentRateSource: 'WACC',
      reinvestmentRiskFreeRate: 0.05,
      reinvestmentOtherRate: 0.09,
    },
    workingCapital: { percentCollected: 0.80, percentCostPaid: 1.0 },
    yearlyCashFlow: createDefaultYearlyCashFlow(7),
  },
  abandonDCFResult: null,
  abandonVolatilityInputs: { base: 1.0, downside: 0.8, upside: 1.5 },
  abandonCalculatedVolatility: 0,
  abandonInputs: {
    volatilitySource: 'Enter Value',
    volatilityDropdown: 0.2,
    selectedIndustry: null,
    volatilityEnterValue: 0.4,
    assetSource: 'Enter Data',
    includePerpetGgity: false,
    manualV0: 480,
    manualI: 500,
    manualAssetLife: 7,
    abandonRecovery: 400,
    abandonCost: 0,
    optionExercise: 6,
    timeStep: 'Yearly',
    riskFreeRate: 0.06,
    recoveryType: 'Fixed Value',
  },
  abandonLattice: null,
  abandonSummary: null,

  // === NPV Only DCF Actions ===
  updateNpvCapitalProfile: (partial) => {
    const state = get();
    const newProfile = { ...state.npvDCFInputs.capitalProfile, ...partial };
    const oldColumnCount = getDCFColumnCount(
      state.npvDCFInputs.capitalProfile,
      state.npvDCFInputs.financialMetrics,
      true,
    );
    const newColumnCount = getDCFColumnCount(
      newProfile,
      state.npvDCFInputs.financialMetrics,
      true,
    );
    let yearlyCashFlow = state.npvDCFInputs.yearlyCashFlow;
    if (newColumnCount !== oldColumnCount) {
      yearlyCashFlow = resizeYearlyCashFlow(
        yearlyCashFlow,
        oldColumnCount,
        newColumnCount,
        state.npvDCFInputs.financialMetrics.includePerpetGgity,
      );
    }
    if (partial.capexYears != null) {
      yearlyCashFlow = clampCapex(yearlyCashFlow, newProfile.capexYears);
    }
    set({
      npvDCFInputs: {
        ...state.npvDCFInputs,
        capitalProfile: newProfile,
        yearlyCashFlow,
      },
    });
    get().recalculateNpvDCF();
  },

  updateNpvFinancialMetrics: (partial) => {
    set((state) => {
      const forceWc100 = partial.financialOutcome === 'Cost Savings';
      const nextFinancialMetrics = { ...state.npvDCFInputs.financialMetrics, ...partial };
      const yearlyCashFlow = resizeYearlyCashFlowOnPerpetuityToggle(
        state.npvDCFInputs.yearlyCashFlow,
        state.npvDCFInputs.capitalProfile,
        state.npvDCFInputs.financialMetrics,
        nextFinancialMetrics,
        true,
      );
      return {
        npvDCFInputs: {
          ...state.npvDCFInputs,
          financialMetrics: nextFinancialMetrics,
          yearlyCashFlow,
          workingCapital: forceWc100
            ? { percentCollected: 1, percentCostPaid: 1 }
            : state.npvDCFInputs.workingCapital,
        },
      };
    });
    get().recalculateNpvDCF();
  },

  updateNpvWorkingCapital: (partial) => {
    set((state) => ({
      npvDCFInputs: {
        ...state.npvDCFInputs,
        workingCapital: { ...state.npvDCFInputs.workingCapital, ...partial },
      },
    }));
    get().recalculateNpvDCF();
  },

  updateNpvYearlyCashFlow: (field, index, value) => {
    set((state) => {
      const arr = [...state.npvDCFInputs.yearlyCashFlow[field]];
      arr[index] = value;
      return {
        npvDCFInputs: {
          ...state.npvDCFInputs,
          yearlyCashFlow: { ...state.npvDCFInputs.yearlyCashFlow, [field]: arr },
        },
      };
    });
    get().recalculateNpvDCF();
  },

  recalculateNpvDCF: () => {
    const { npvDCFInputs } = get();
    const npvDCFResult = safeCalculateDCF({ ...npvDCFInputs, isDelayDCF: true });
    set({ npvDCFResult });
  },

  // === Delay DCF Actions ===
  updateDelayCapitalProfile: (partial) => {
    const state = get();
    const newProfile = { ...state.delayDCFInputs.capitalProfile, ...partial };
    const oldColumnCount = getDCFColumnCount(
      state.delayDCFInputs.capitalProfile,
      state.delayDCFInputs.financialMetrics,
      true,
    );
    const newColumnCount = getDCFColumnCount(
      newProfile,
      state.delayDCFInputs.financialMetrics,
      true,
    );
    const maxExercise = Math.max(1, newProfile.assetLife - 1);
    let yearlyCashFlow = state.delayDCFInputs.yearlyCashFlow;
    if (newColumnCount !== oldColumnCount) {
      yearlyCashFlow = resizeYearlyCashFlow(
        yearlyCashFlow,
        oldColumnCount,
        newColumnCount,
        state.delayDCFInputs.financialMetrics.includePerpetGgity,
      );
    }
    if (partial.capexYears != null) {
      yearlyCashFlow = clampCapex(yearlyCashFlow, newProfile.capexYears);
    }
    const currentEffectiveLife = effectiveDelayAssetLife(state.delayInputs, state.delayDCFInputs);
    const clampedOptionExercise = Math.min(state.delayInputs.optionExercise, Math.max(1, currentEffectiveLife - 1));
    const nextTimeStep = isTimeStepValid(state.delayInputs.timeStep, clampedOptionExercise)
      ? state.delayInputs.timeStep
      : 'Yearly';

    set({
      delayDCFInputs: {
        ...state.delayDCFInputs,
        capitalProfile: newProfile,
        yearlyCashFlow,
      },
      delayInputs: {
        ...state.delayInputs,
        optionExercise: clampedOptionExercise,
        timeStep: nextTimeStep,
      },
    });
    get().recalculateDelayDCF();
  },

  updateDelayFinancialMetrics: (partial) => {
    set((state) => {
      const forceWc100 = partial.financialOutcome === 'Cost Savings';
      const nextFinancialMetrics = { ...state.delayDCFInputs.financialMetrics, ...partial };
      const yearlyCashFlow = resizeYearlyCashFlowOnPerpetuityToggle(
        state.delayDCFInputs.yearlyCashFlow,
        state.delayDCFInputs.capitalProfile,
        state.delayDCFInputs.financialMetrics,
        nextFinancialMetrics,
        true,
      );
      return {
        delayDCFInputs: {
          ...state.delayDCFInputs,
          financialMetrics: nextFinancialMetrics,
          workingCapital: forceWc100
            ? { ...state.delayDCFInputs.workingCapital, percentCollected: 1, percentCostPaid: 1 }
            : state.delayDCFInputs.workingCapital,
          yearlyCashFlow,
        },
      };
    });
    get().recalculateDelayDCF();
  },

  updateDelayWorkingCapital: (partial) => {
    set((state) => ({
      delayDCFInputs: {
        ...state.delayDCFInputs,
        workingCapital: { ...state.delayDCFInputs.workingCapital, ...partial },
      },
    }));
    get().recalculateDelayDCF();
  },

  updateDelayYearlyCashFlow: (field, index, value) => {
    set((state) => {
      const arr = [...state.delayDCFInputs.yearlyCashFlow[field]];
      arr[index] = value;
      return {
        delayDCFInputs: {
          ...state.delayDCFInputs,
          yearlyCashFlow: { ...state.delayDCFInputs.yearlyCashFlow, [field]: arr },
        },
      };
    });
    get().recalculateDelayDCF();
  },

  updateDelayVolatilityInputs: (partial) => {
    set((state) => ({
      delayVolatilityInputs: { ...state.delayVolatilityInputs, ...partial },
      delayCalculatedVolatility: calculateVolatility({ ...state.delayVolatilityInputs, ...partial }),
    }));
    get().recalculateDelay();
  },

  recalculateDelayDCF: () => {
    const { delayDCFInputs, delayVolatilityInputs } = get();
    const delayDCFResult = safeCalculateDCF({ ...delayDCFInputs, isDelayDCF: true });
    const delayCalculatedVolatility = safeCalculateVolatility(delayVolatilityInputs);
    set({ delayDCFResult, delayCalculatedVolatility });
    get().recalculateDelay();
  },

  updateDelayInputs: (partial) => {
    set((state) => {
      const merged = { ...state.delayInputs, ...partial };
      const maxExercise = Math.max(1, effectiveDelayAssetLife(merged, state.delayDCFInputs) - 1);
      merged.optionExercise = Math.min(merged.optionExercise, maxExercise);
      if (partial.optionExercise != null && !isTimeStepValid(merged.timeStep, merged.optionExercise)) {
        merged.timeStep = 'Yearly';
      }
      return { delayInputs: merged };
    });
    get().recalculateDelay();
  },

  recalculateDelay: () => {
    const { delayInputs, delayDCFResult, delayCalculatedVolatility, delayDCFInputs } = get();
    const maxExercise = Math.max(1, effectiveDelayAssetLife(delayInputs, delayDCFInputs) - 1);
    const clampedOptionExercise = Math.min(delayInputs.optionExercise, maxExercise);
    const nextTimeStep = isTimeStepValid(delayInputs.timeStep, clampedOptionExercise)
      ? delayInputs.timeStep
      : 'Yearly';
    const sanitizedInputs =
      clampedOptionExercise !== delayInputs.optionExercise || nextTimeStep !== delayInputs.timeStep
        ? { ...delayInputs, optionExercise: clampedOptionExercise, timeStep: nextTimeStep }
        : delayInputs;
    if (sanitizedInputs !== delayInputs) {
      set({ delayInputs: sanitizedInputs });
    }
    const effectiveLife = effectiveDelayAssetLife(sanitizedInputs, delayDCFInputs);
    const delayInputsForEngine: DelayInputs = {
      ...sanitizedInputs,
      includePerpetGgity: delayDCFInputs.financialMetrics.includePerpetGgity,
    };
    try {
      const result = calculateOptionToDelay(
        delayInputsForEngine,
        delayDCFResult?.summary ?? null,
        delayCalculatedVolatility,
        effectiveLife,
      );
      set({ delayLattice: result.lattice, delaySummary: result.summary });
    } catch {
      set({ delayLattice: null, delaySummary: null });
    }
  },

  // === Expand Original DCF Actions ===
  updateExpandOriginalCapitalProfile: (partial) => {
    const state = get();
    const newProfile = { ...state.expandOriginalDCFInputs.capitalProfile, ...partial };
    const oldColumnCount = getDCFColumnCount(
      state.expandOriginalDCFInputs.capitalProfile,
      state.expandOriginalDCFInputs.financialMetrics,
      false,
    );
    const newColumnCount = getDCFColumnCount(
      newProfile,
      state.expandOriginalDCFInputs.financialMetrics,
      false,
    );
    const maxExercise = Math.max(1, newProfile.assetLife - 1);
    let yearlyCashFlow = state.expandOriginalDCFInputs.yearlyCashFlow;
    if (newColumnCount !== oldColumnCount) {
      yearlyCashFlow = resizeYearlyCashFlow(
        yearlyCashFlow,
        oldColumnCount,
        newColumnCount,
        state.expandOriginalDCFInputs.financialMetrics.includePerpetGgity,
      );
    }
    if (partial.capexYears != null) {
      yearlyCashFlow = clampCapex(yearlyCashFlow, newProfile.capexYears);
    }
    const currentEffectiveLife = effectiveExpandAssetLife(state.expandInputs, state.expandExpansionDCFInputs);
    const clampedOptionExercise = Math.min(state.expandInputs.optionExercise, Math.max(1, currentEffectiveLife - 1));
    const nextTimeStep = isTimeStepValid(state.expandInputs.timeStep, clampedOptionExercise)
      ? state.expandInputs.timeStep
      : 'Yearly';
    set({
      expandOriginalDCFInputs: { ...state.expandOriginalDCFInputs, capitalProfile: newProfile, yearlyCashFlow },
      expandInputs: {
        ...state.expandInputs,
        optionExercise: clampedOptionExercise,
        timeStep: nextTimeStep,
      },
    });
    get().recalculateExpandOriginalDCF();
  },
  updateExpandOriginalFinancialMetrics: (partial) => {
    set((state) => {
      const forceWc100 = partial.financialOutcome === 'Cost Savings';
      const nextFinancialMetrics = { ...state.expandOriginalDCFInputs.financialMetrics, ...partial };
      const yearlyCashFlow = resizeYearlyCashFlowOnPerpetuityToggle(
        state.expandOriginalDCFInputs.yearlyCashFlow,
        state.expandOriginalDCFInputs.capitalProfile,
        state.expandOriginalDCFInputs.financialMetrics,
        nextFinancialMetrics,
        false,
      );
      return {
        expandOriginalDCFInputs: {
          ...state.expandOriginalDCFInputs,
          financialMetrics: nextFinancialMetrics,
          workingCapital: forceWc100
            ? { ...state.expandOriginalDCFInputs.workingCapital, percentCollected: 1, percentCostPaid: 1 }
            : state.expandOriginalDCFInputs.workingCapital,
          yearlyCashFlow,
        },
      };
    });
    get().recalculateExpandOriginalDCF();
  },
  updateExpandOriginalWorkingCapital: (partial) => {
    set((state) => ({
      expandOriginalDCFInputs: { ...state.expandOriginalDCFInputs, workingCapital: { ...state.expandOriginalDCFInputs.workingCapital, ...partial } },
    }));
    get().recalculateExpandOriginalDCF();
  },
  updateExpandOriginalYearlyCashFlow: (field, index, value) => {
    set((state) => {
      const arr = [...state.expandOriginalDCFInputs.yearlyCashFlow[field]];
      arr[index] = value;
      return { expandOriginalDCFInputs: { ...state.expandOriginalDCFInputs, yearlyCashFlow: { ...state.expandOriginalDCFInputs.yearlyCashFlow, [field]: arr } } };
    });
    get().recalculateExpandOriginalDCF();
  },
  recalculateExpandOriginalDCF: () => {
    const { expandOriginalDCFInputs } = get();
    const expandOriginalDCFResult = safeCalculateDCF(expandOriginalDCFInputs);
    set({ expandOriginalDCFResult });
    get().recalculateExpand();
  },

  // === Expand Expansion DCF Actions ===
  updateExpandExpansionCapitalProfile: (partial) => {
    const state = get();
    const newProfile = { ...state.expandExpansionDCFInputs.capitalProfile, ...partial };
    const oldColumnCount = getDCFColumnCount(
      state.expandExpansionDCFInputs.capitalProfile,
      state.expandExpansionDCFInputs.financialMetrics,
      false,
    );
    const newColumnCount = getDCFColumnCount(
      newProfile,
      state.expandExpansionDCFInputs.financialMetrics,
      false,
    );
    const maxExercise = Math.max(1, newProfile.assetLife - 1);
    let yearlyCashFlow = state.expandExpansionDCFInputs.yearlyCashFlow;
    if (newColumnCount !== oldColumnCount) {
      yearlyCashFlow = resizeYearlyCashFlow(
        yearlyCashFlow,
        oldColumnCount,
        newColumnCount,
        state.expandExpansionDCFInputs.financialMetrics.includePerpetGgity,
      );
    }
    if (partial.capexYears != null) {
      yearlyCashFlow = clampCapex(yearlyCashFlow, newProfile.capexYears);
    }
    const currentEffectiveLife = effectiveExpandAssetLife(state.expandInputs, state.expandExpansionDCFInputs);
    const clampedOptionExercise = Math.min(state.expandInputs.optionExercise, Math.max(1, currentEffectiveLife - 1));
    const nextTimeStep = isTimeStepValid(state.expandInputs.timeStep, clampedOptionExercise)
      ? state.expandInputs.timeStep
      : 'Yearly';
    set({
      expandExpansionDCFInputs: { ...state.expandExpansionDCFInputs, capitalProfile: newProfile, yearlyCashFlow },
      expandInputs: {
        ...state.expandInputs,
        optionExercise: clampedOptionExercise,
        timeStep: nextTimeStep,
      },
    });
    get().recalculateExpandExpansionDCF();
  },
  updateExpandExpansionFinancialMetrics: (partial) => {
    set((state) => {
      const forceWc100 = partial.financialOutcome === 'Cost Savings';
      const nextFinancialMetrics = { ...state.expandExpansionDCFInputs.financialMetrics, ...partial };
      const yearlyCashFlow = resizeYearlyCashFlowOnPerpetuityToggle(
        state.expandExpansionDCFInputs.yearlyCashFlow,
        state.expandExpansionDCFInputs.capitalProfile,
        state.expandExpansionDCFInputs.financialMetrics,
        nextFinancialMetrics,
        false,
      );
      return {
        expandExpansionDCFInputs: {
          ...state.expandExpansionDCFInputs,
          financialMetrics: nextFinancialMetrics,
          workingCapital: forceWc100
            ? { ...state.expandExpansionDCFInputs.workingCapital, percentCollected: 1, percentCostPaid: 1 }
            : state.expandExpansionDCFInputs.workingCapital,
          yearlyCashFlow,
        },
      };
    });
    get().recalculateExpandExpansionDCF();
  },
  updateExpandExpansionWorkingCapital: (partial) => {
    set((state) => ({
      expandExpansionDCFInputs: { ...state.expandExpansionDCFInputs, workingCapital: { ...state.expandExpansionDCFInputs.workingCapital, ...partial } },
    }));
    get().recalculateExpandExpansionDCF();
  },
  updateExpandExpansionYearlyCashFlow: (field, index, value) => {
    set((state) => {
      const arr = [...state.expandExpansionDCFInputs.yearlyCashFlow[field]];
      arr[index] = value;
      return { expandExpansionDCFInputs: { ...state.expandExpansionDCFInputs, yearlyCashFlow: { ...state.expandExpansionDCFInputs.yearlyCashFlow, [field]: arr } } };
    });
    get().recalculateExpandExpansionDCF();
  },
  updateExpandVolatilityInputs: (partial) => {
    set((state) => ({
      expandVolatilityInputs: { ...state.expandVolatilityInputs, ...partial },
      expandCalculatedVolatility: calculateVolatility({ ...state.expandVolatilityInputs, ...partial }),
    }));
    get().recalculateExpand();
  },
  recalculateExpandExpansionDCF: () => {
    const { expandExpansionDCFInputs, expandVolatilityInputs } = get();
    const expandExpansionDCFResult = safeCalculateDCF(expandExpansionDCFInputs);
    const expandCalculatedVolatility = safeCalculateVolatility(expandVolatilityInputs);
    set({ expandExpansionDCFResult, expandCalculatedVolatility });
    get().recalculateExpand();
  },

  // === Expand ROV Actions ===
  updateExpandInputs: (partial) => {
    set((state) => {
      const merged = { ...state.expandInputs, ...partial };
      const maxExercise = Math.max(1, effectiveExpandAssetLife(merged, state.expandExpansionDCFInputs) - 1);
      merged.optionExercise = Math.min(merged.optionExercise, maxExercise);
      if (partial.optionExercise != null && !isTimeStepValid(merged.timeStep, merged.optionExercise)) {
        merged.timeStep = 'Yearly';
      }
      return { expandInputs: merged };
    });
    get().recalculateExpand();
  },

  recalculateExpand: () => {
    const {
      expandInputs,
      expandOriginalDCFResult,
      expandExpansionDCFResult,
      expandExpansionDCFInputs,
      expandCalculatedVolatility,
    } = get();
    const maxExercise = Math.max(1, effectiveExpandAssetLife(expandInputs, expandExpansionDCFInputs) - 1);
    const clampedOptionExercise = Math.min(expandInputs.optionExercise, maxExercise);
    const nextTimeStep = isTimeStepValid(expandInputs.timeStep, clampedOptionExercise)
      ? expandInputs.timeStep
      : 'Yearly';
    const sanitizedInputs =
      clampedOptionExercise !== expandInputs.optionExercise || nextTimeStep !== expandInputs.timeStep
        ? { ...expandInputs, optionExercise: clampedOptionExercise, timeStep: nextTimeStep }
        : expandInputs;
    if (sanitizedInputs !== expandInputs) {
      set({ expandInputs: sanitizedInputs });
    }
    // Expand (2): Base MIRR N/A follows Expansion DCF Include Perpetuity only. Original subview uses Original DCF MIRR separately.
    const expandInputsForEngine: ExpandInputs = {
      ...sanitizedInputs,
      includePerpetGgity: expandExpansionDCFInputs.financialMetrics.includePerpetGgity,
    };
    try {
      const result = calculateOptionToExpand(
        expandInputsForEngine,
        expandOriginalDCFResult,
        expandExpansionDCFResult?.summary ?? null,
        expandCalculatedVolatility,
        effectiveExpandAssetLife(sanitizedInputs, expandExpansionDCFInputs),
      );
      set({ expandLattice: result.lattice, expandSummary: result.summary });
    } catch {
      set({ expandLattice: null, expandSummary: null });
    }
  },

  // === Abandon DCF Actions ===
  updateAbandonCapitalProfile: (partial) => {
    const state = get();
    const newProfile = { ...state.abandonDCFInputs.capitalProfile, ...partial };
    const oldColumnCount = getDCFColumnCount(
      state.abandonDCFInputs.capitalProfile,
      state.abandonDCFInputs.financialMetrics,
      false,
    );
    const newColumnCount = getDCFColumnCount(
      newProfile,
      state.abandonDCFInputs.financialMetrics,
      false,
    );
    const maxExercise = Math.max(1, newProfile.assetLife - 1);
    let yearlyCashFlow = state.abandonDCFInputs.yearlyCashFlow;
    if (newColumnCount !== oldColumnCount) {
      yearlyCashFlow = resizeYearlyCashFlow(
        yearlyCashFlow,
        oldColumnCount,
        newColumnCount,
        state.abandonDCFInputs.financialMetrics.includePerpetGgity,
      );
    }
    if (partial.capexYears != null) {
      yearlyCashFlow = clampCapex(yearlyCashFlow, newProfile.capexYears);
    }
    const currentEffectiveLife = effectiveAbandonAssetLife(state.abandonInputs, state.abandonDCFInputs);
    const clampedOptionExercise = Math.min(state.abandonInputs.optionExercise, Math.max(1, currentEffectiveLife - 1));
    const nextTimeStep = isTimeStepValid(state.abandonInputs.timeStep, clampedOptionExercise)
      ? state.abandonInputs.timeStep
      : 'Yearly';
    set({
      abandonDCFInputs: { ...state.abandonDCFInputs, capitalProfile: newProfile, yearlyCashFlow },
      abandonInputs: {
        ...state.abandonInputs,
        optionExercise: clampedOptionExercise,
        timeStep: nextTimeStep,
      },
    });
    get().recalculateAbandonDCF();
  },
  updateAbandonFinancialMetrics: (partial) => {
    set((state) => {
      const forceWc100 = partial.financialOutcome === 'Cost Savings';
      const nextFinancialMetrics = { ...state.abandonDCFInputs.financialMetrics, ...partial };
      const yearlyCashFlow = resizeYearlyCashFlowOnPerpetuityToggle(
        state.abandonDCFInputs.yearlyCashFlow,
        state.abandonDCFInputs.capitalProfile,
        state.abandonDCFInputs.financialMetrics,
        nextFinancialMetrics,
        false,
      );
      return {
        abandonDCFInputs: {
          ...state.abandonDCFInputs,
          financialMetrics: nextFinancialMetrics,
          workingCapital: forceWc100
            ? { ...state.abandonDCFInputs.workingCapital, percentCollected: 1, percentCostPaid: 1 }
            : state.abandonDCFInputs.workingCapital,
          yearlyCashFlow,
        },
      };
    });
    get().recalculateAbandonDCF();
  },
  updateAbandonWorkingCapital: (partial) => {
    set((state) => ({
      abandonDCFInputs: { ...state.abandonDCFInputs, workingCapital: { ...state.abandonDCFInputs.workingCapital, ...partial } },
    }));
    get().recalculateAbandonDCF();
  },
  updateAbandonYearlyCashFlow: (field, index, value) => {
    set((state) => {
      const arr = [...state.abandonDCFInputs.yearlyCashFlow[field]];
      arr[index] = value;
      return { abandonDCFInputs: { ...state.abandonDCFInputs, yearlyCashFlow: { ...state.abandonDCFInputs.yearlyCashFlow, [field]: arr } } };
    });
    get().recalculateAbandonDCF();
  },
  updateAbandonVolatilityInputs: (partial) => {
    set((state) => ({
      abandonVolatilityInputs: { ...state.abandonVolatilityInputs, ...partial },
      abandonCalculatedVolatility: calculateVolatility({ ...state.abandonVolatilityInputs, ...partial }),
    }));
    get().recalculateAbandon();
  },
  recalculateAbandonDCF: () => {
    const { abandonDCFInputs, abandonVolatilityInputs } = get();
    const abandonDCFResult = safeCalculateDCF(abandonDCFInputs);
    const abandonCalculatedVolatility = safeCalculateVolatility(abandonVolatilityInputs);
    set({ abandonDCFResult, abandonCalculatedVolatility });
    get().recalculateAbandon();
  },

  // === Abandon ROV Actions ===
  updateAbandonInputs: (partial) => {
    set((state) => {
      const merged = { ...state.abandonInputs, ...partial };
      const maxExercise = Math.max(1, effectiveAbandonAssetLife(merged, state.abandonDCFInputs) - 1);
      merged.optionExercise = Math.min(merged.optionExercise, maxExercise);
      if (partial.optionExercise != null && !isTimeStepValid(merged.timeStep, merged.optionExercise)) {
        merged.timeStep = 'Yearly';
      }
      return { abandonInputs: merged };
    });
    get().recalculateAbandon();
  },

  recalculateAbandon: () => {
    const { abandonInputs, abandonDCFInputs, abandonDCFResult, abandonCalculatedVolatility } = get();
    const maxExercise = Math.max(1, effectiveAbandonAssetLife(abandonInputs, abandonDCFInputs) - 1);
    const clampedOptionExercise = Math.min(abandonInputs.optionExercise, maxExercise);
    const nextTimeStep = isTimeStepValid(abandonInputs.timeStep, clampedOptionExercise)
      ? abandonInputs.timeStep
      : 'Yearly';
    const sanitizedInputs =
      clampedOptionExercise !== abandonInputs.optionExercise || nextTimeStep !== abandonInputs.timeStep
        ? { ...abandonInputs, optionExercise: clampedOptionExercise, timeStep: nextTimeStep }
        : abandonInputs;
    if (sanitizedInputs !== abandonInputs) {
      set({ abandonInputs: sanitizedInputs });
    }
    const abandonInputsForEngine: AbandonInputs = {
      ...sanitizedInputs,
      includePerpetGgity: abandonDCFInputs.financialMetrics.includePerpetGgity,
    };
    try {
      const result = calculateOptionToAbandon(
        abandonInputsForEngine,
        abandonDCFResult?.summary ?? null,
        abandonCalculatedVolatility,
        effectiveAbandonAssetLife(sanitizedInputs, abandonDCFInputs),
      );
      set({ abandonLattice: result.lattice, abandonSummary: result.summary });
    } catch {
      set({ abandonLattice: null, abandonSummary: null });
    }
  },

  // === Cross-sheet copy actions ===
  copyDelayToExpand: (target) => {
    const s = get();
    const sharedRovFromDelay = {
      optionExercise: s.delayInputs.optionExercise,
      timeStep: s.delayInputs.timeStep,
      riskFreeRate: s.delayInputs.riskFreeRate,
      includeCostOfDelay: s.delayInputs.includeCostOfDelay,
      includeFVStrike: s.delayInputs.includeFVStrike,
    };

    set((state) => {
      const nextExpandInputs: ExpandInputs =
        target === 'original'
          ? {
              ...state.expandInputs,
              ...sharedRovFromDelay,
              currentSource: s.delayInputs.assetSource,
              manualV0Current: s.delayInputs.manualV0,
              manualICurrent: s.delayInputs.manualI,
            }
          : {
              ...state.expandInputs,
              ...sharedRovFromDelay,
              volatilitySource: s.delayInputs.volatilitySource,
              volatilityDropdown: s.delayInputs.volatilityDropdown,
              selectedIndustry: s.delayInputs.selectedIndustry,
              volatilityEnterValue: s.delayInputs.volatilityEnterValue,
              expansionSource: s.delayInputs.assetSource,
              manualV0Expansion: s.delayInputs.manualV0,
              manualIExpansion: s.delayInputs.manualI,
              manualExpansionAssetLife: s.delayInputs.manualAssetLife,
            };

      const nextExpandVolatilityInputs: VolatilityInputs =
        target === 'expansion'
          ? { ...state.expandVolatilityInputs, ...s.delayVolatilityInputs }
          : state.expandVolatilityInputs;

      const nextExpandOriginalDCFInputs =
        target === 'original'
          ? copyDelayDCFInto(state.expandOriginalDCFInputs, s.delayDCFInputs)
          : state.expandOriginalDCFInputs;
      const nextExpandExpansionDCFInputs =
        target === 'expansion'
          ? copyDelayDCFInto(state.expandExpansionDCFInputs, s.delayDCFInputs)
          : state.expandExpansionDCFInputs;

      return {
        expandInputs: nextExpandInputs,
        expandVolatilityInputs: nextExpandVolatilityInputs,
        expandCalculatedVolatility: safeCalculateVolatility(nextExpandVolatilityInputs),
        expandOriginalDCFInputs: nextExpandOriginalDCFInputs,
        expandExpansionDCFInputs: nextExpandExpansionDCFInputs,
      };
    });
    const after = get();
    let expandOriginalDCFResult: DCFResult | null = after.expandOriginalDCFResult;
    let expandExpansionDCFResult: DCFResult | null = after.expandExpansionDCFResult;
    if (target === 'original') {
      expandOriginalDCFResult = safeCalculateDCF(after.expandOriginalDCFInputs);
    }
    if (target === 'expansion') {
      expandExpansionDCFResult = safeCalculateDCF(after.expandExpansionDCFInputs);
    }
    set({
      expandOriginalDCFResult,
      expandExpansionDCFResult,
      expandCalculatedVolatility: safeCalculateVolatility(after.expandVolatilityInputs),
    });
    get().recalculateExpand();
  },

  copyDelayToAbandon: () => {
    const s = get();
    set((state) => {
      const nextAbandonInputs: AbandonInputs = {
        ...state.abandonInputs,
        volatilitySource: s.delayInputs.volatilitySource,
        volatilityDropdown: s.delayInputs.volatilityDropdown,
        selectedIndustry: s.delayInputs.selectedIndustry,
        volatilityEnterValue: s.delayInputs.volatilityEnterValue,
        optionExercise: s.delayInputs.optionExercise,
        timeStep: s.delayInputs.timeStep,
        riskFreeRate: s.delayInputs.riskFreeRate,
        assetSource: s.delayInputs.assetSource,
        manualV0: s.delayInputs.manualV0,
        manualI: s.delayInputs.manualI,
        manualAssetLife: s.delayInputs.manualAssetLife,
      };

      const nextAbandonVolatilityInputs: VolatilityInputs = {
        ...state.abandonVolatilityInputs,
        ...s.delayVolatilityInputs,
      };
      const nextAbandonDCFInputs = copyDelayDCFInto(
        state.abandonDCFInputs,
        s.delayDCFInputs,
        'use-delay-profile',
      );

      return {
        abandonInputs: nextAbandonInputs,
        abandonVolatilityInputs: nextAbandonVolatilityInputs,
        abandonCalculatedVolatility: safeCalculateVolatility(nextAbandonVolatilityInputs),
        abandonDCFInputs: nextAbandonDCFInputs,
      };
    });
    // Compute DCF once, then trigger a single downstream ROV recalculation.
    const after = get();
    const abandonCalculatedVolatility = safeCalculateVolatility(after.abandonVolatilityInputs);
    const abandonDCFResult = safeCalculateDCF(after.abandonDCFInputs);
    set({ abandonDCFResult, abandonCalculatedVolatility });
    get().recalculateAbandon();
  },
});

export const createFinancialStore = () => create<FinancialStore>(financialStoreInitializer);

/** Initial DCF + ROV calculations for a new store instance (route or embed). */
export function bootstrapFinancialStore(store: StoreApi<FinancialStore>) {
  const initialState = store.getState();
  try {
    const npvDCFResult = safeCalculateDCF({
      ...initialState.npvDCFInputs,
      isDelayDCF: true,
    });
    store.setState({ npvDCFResult });
  } catch {
    /* ignore */
  }
  try {
    const delayDCFResult = safeCalculateDCF({
      ...initialState.delayDCFInputs,
      isDelayDCF: true,
    });
    const delayCalculatedVolatility = safeCalculateVolatility(
      initialState.delayVolatilityInputs,
    );
    store.setState({ delayDCFResult, delayCalculatedVolatility });
  } catch {
    /* ignore */
  }
  store.getState().recalculateDelay();
  try {
    const expandOriginalDCFResult = safeCalculateDCF(initialState.expandOriginalDCFInputs);
    store.setState({ expandOriginalDCFResult });
  } catch {
    /* ignore */
  }
  try {
    const expandExpansionDCFResult = safeCalculateDCF(
      initialState.expandExpansionDCFInputs,
    );
    const expandCalculatedVolatility = safeCalculateVolatility(
      initialState.expandVolatilityInputs,
    );
    store.setState({ expandExpansionDCFResult, expandCalculatedVolatility });
  } catch {
    /* ignore */
  }
  store.getState().recalculateExpand();
  try {
    const abandonDCFResult = safeCalculateDCF(initialState.abandonDCFInputs);
    const abandonCalculatedVolatility = safeCalculateVolatility(
      initialState.abandonVolatilityInputs,
    );
    store.setState({ abandonDCFResult, abandonCalculatedVolatility });
  } catch {
    /* ignore */
  }
  store.getState().recalculateAbandon();
}

/** New store with initial DCF + ROV pass (for route or embed). */
export function createBootstrappedFinancialStore() {
  const store = createFinancialStore();
  bootstrapFinancialStore(store);
  return store;
}

function resizeYearlyCashFlow(
  current: DCFInputs['yearlyCashFlow'],
  oldColumnCount: number,
  newColumnCount: number,
  preservePerpetuityColumn: boolean = false
) {
  const resize = (arr: number[]) => {
    const newArr = Array(newColumnCount).fill(0);

    if (!preservePerpetuityColumn) {
      for (let i = 0; i < Math.min(arr.length, newArr.length); i++) {
        newArr[i] = arr[i];
      }
      return newArr;
    }

    // Keep the perpetuity input anchored at the last column when table size changes.
    const oldPerpIdx = oldColumnCount - 1;
    const newPerpIdx = newColumnCount - 1;
    const oldNonPerpCount = Math.max(0, oldColumnCount - 1);
    const newNonPerpCount = Math.max(0, newColumnCount - 1);
    const copyCount = Math.max(0, Math.min(oldNonPerpCount, newNonPerpCount));

    for (let i = 0; i < copyCount; i++) {
      newArr[i] = arr[i];
    }

    if (newPerpIdx >= 0) {
      const oldPerpValue = oldPerpIdx >= 0 ? (arr[oldPerpIdx] ?? 0) : 0;
      newArr[newPerpIdx] = oldPerpValue;
    }

    return newArr;
  };
  return {
    capex: resize(current.capex),
    revenue: resize(current.revenue),
    costOfSales: resize(current.costOfSales),
    opex: resize(current.opex),
  };
}

function resizeYearlyCashFlowOnPerpetuityToggle(
  current: DCFInputs['yearlyCashFlow'],
  capitalProfile: DCFInputs['capitalProfile'],
  currentFinancialMetrics: DCFInputs['financialMetrics'],
  nextFinancialMetrics: DCFInputs['financialMetrics'],
  isDelayDCF: boolean,
): DCFInputs['yearlyCashFlow'] {
  if (currentFinancialMetrics.includePerpetGgity === nextFinancialMetrics.includePerpetGgity) {
    return current;
  }
  return resizeYearlyCashFlow(
    current,
    getDCFColumnCount(capitalProfile, currentFinancialMetrics, isDelayDCF),
    getDCFColumnCount(capitalProfile, nextFinancialMetrics, isDelayDCF),
  );
}

function getDCFColumnCount(
  capitalProfile: DCFInputs['capitalProfile'],
  financialMetrics: DCFInputs['financialMetrics'],
  isDelayDCF: boolean,
): number {
  const baseYears = capitalProfile.capexYears + capitalProfile.assetLife;
  const totalYears = capitalProfile.hasExtraYear ? baseYears + 1 : baseYears;
  if (financialMetrics.includePerpetGgity) {
    return totalYears + (isDelayDCF ? 2 : 1);
  }
  return totalYears + (isDelayDCF ? 1 : 0);
}

/** Zero out capex entries beyond capexYears (indices >= capexYears become 0) */
function clampCapex(
  yearlyCashFlow: DCFInputs['yearlyCashFlow'],
  capexYears: number
): DCFInputs['yearlyCashFlow'] {
  const capex = [...yearlyCashFlow.capex];
  for (let i = capexYears; i < capex.length; i++) {
    capex[i] = 0;
  }
  return { ...yearlyCashFlow, capex };
}
