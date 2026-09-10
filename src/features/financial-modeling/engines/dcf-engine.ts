import type {
  DCFInputs,
  DCFResult,
  DCFYearResult,
  VolatilityInputs,
} from '../types';

/**
 * Master Option to Expand (2) D88 / D89 when "Use DCF Output":
 * SUM('Master - Option to Expand (1)'!D58:AI58) and -SUM(...!D59:AI59).
 * Matches per-column Post Tax Cash Flow PV and Investments PV (includes Y0 column; summary.v0 omits index 0).
 */
export function getExpandCurrentVIFromOriginalDCFGrid(result: DCFResult): {
  v0: number;
  investment: number;
} {
  const yr = result.yearResults;
  const v0 = yr.reduce((s, r) => s + r.postTaxNonInvestmentCashflowPV, 0);
  const investment = -yr.reduce((s, r) => s + r.investmentsPV, 0);
  return { v0, investment };
}

export function calculateDCF(inputs: DCFInputs): DCFResult {
  const { capitalProfile, financialMetrics, workingCapital, yearlyCashFlow } = inputs;
  const { capexYears, assetLife, depreciationMethod, residualValue, nonDepreciatingAsset, capexIncludesNonDepreciating, depreciableOverride } = capitalProfile;
  const { wacc, reinvestmentRate, taxRate, includePerpetGgity, perpetuityType, perpetuityGrowthRate } = financialMetrics;
  const { percentCollected, percentCostPaid } = workingCapital;
  const { capex, revenue, costOfSales, opex } = yearlyCashFlow;

  const baseYears = capexYears + assetLife;
  const totalYears = baseYears;
  const numColumns = includePerpetGgity ? baseYears +  2 : totalYears +  1;

  // Compute totalCAPEX (positive number from negative capex values)
  const totalCAPEX = -capex.reduce((sum, v) => sum + v, 0);
  // Depreciable base: use override if provided, else exclude nonDepreciatingAsset when CAPEX already includes it
  const depreciableBase = depreciableOverride != null
    ? depreciableOverride
    : capexIncludesNonDepreciating
      ? totalCAPEX - nonDepreciatingAsset
      : totalCAPEX;

  const yearResults: DCFYearResult[] = [];

  // We need two passes for DDB because beginningBookValue depends on prior cumulativeDepreciation.
  // Actually we can do it in one forward pass.

  // Tracking variables
  let cumulativeDepreciation = 0;
  let beginningBookValue = depreciableBase;

  for (let t = 0; t < numColumns; t++) {
    const pvYear = t;
    const assetYearCounter = -capexYears + 1 + t;
    const isPerpetuityColumn = includePerpetGgity && t === numColumns - 1;

    // 1. WACC Discount Factor
    let waccDiscountFactor: number;
    if (isPerpetuityColumn) {
      if (perpetuityType === 'Growing') {
        waccDiscountFactor =
          (1 / (wacc - perpetuityGrowthRate)) *
          (1 / Math.pow(1 + wacc, 1 + assetLife));
      } else {
        // Constant
        waccDiscountFactor =
          (1 / wacc) *
          (1 / Math.pow(1 + wacc, 1 + assetLife));
      }
    } else {
      waccDiscountFactor = 1 / Math.pow(1 + wacc, t);
    }

    // 2. Reinvestment Discount Factor (not used when perpetuity is included)
    let reinvestmentDiscountFactor = 0;
    if (!includePerpetGgity) {
      reinvestmentDiscountFactor = Math.pow(1 + reinvestmentRate, totalYears - t);
    }

    // For perpetuity column: CAPEX is always 0, but Revenue/COS/Opex are user-editable
    const yearCapex = isPerpetuityColumn ? 0 : (capex[t] ?? 0);
    const yearRevenue = revenue[t] ?? 0;
    const yearCostOfSales = costOfSales[t] ?? 0;
    const yearOpex = opex[t] ?? 0;

    // 3. Gross Profit
    const grossProfit = yearRevenue - yearCostOfSales;

    // 4. Operating Cash Flows
    const operatingCashFlows = grossProfit - yearOpex;

    // 5. Payables (explicitly 0 for perpetuity per spreadsheet)
    const payables = isPerpetuityColumn ? 0 : (1 - percentCostPaid) * yearCostOfSales;

    // 6. Receivables (explicitly 0 for perpetuity per spreadsheet)
    const receivables = isPerpetuityColumn ? 0 : (1 - percentCollected) * yearRevenue;

    // 7. Change in Net Working Capital (explicitly 0 for perpetuity per spreadsheet)
    let changeInNetWorkingCapital: number;
    if (isPerpetuityColumn) {
      changeInNetWorkingCapital = 0;
    } else if (t === 0) {
      changeInNetWorkingCapital = payables - receivables;
    } else {
      const prevPayables = yearResults[t - 1].payables;
      const prevReceivables = yearResults[t - 1].receivables;
      changeInNetWorkingCapital =
        (payables - prevPayables) + (prevReceivables - receivables);
    }

    // 8. Asset/CAPEX Opportunity Cost/Recovery
    // Recovery happens at capexYears + assetLife - 1 (the end of asset life),
    // which differs from totalYears - 1 when hasExtraYear is set.
    let assetRecovery: number;
    if (!isPerpetuityColumn && pvYear === 0 && !capexIncludesNonDepreciating) {
      assetRecovery = -nonDepreciatingAsset;
    } else if (!isPerpetuityColumn && pvYear === baseYears - 1) {
      assetRecovery = nonDepreciatingAsset + residualValue;
    } else {
      assetRecovery = 0;
    }

    // 9. Net Cash Flows
    const netCashFlows = yearCapex + assetRecovery + operatingCashFlows + changeInNetWorkingCapital;

    // 10. Net Cash Flow PV
    const netCashFlowPV = waccDiscountFactor * netCashFlows;

    // 11. Asset Depreciation
    // Parity: NPV.Calculation Innoster — sheet "Master - Option to Expand (1)" row 47 (xl/worksheets/sheet4.xml).
    // Params: D5=capexYears, D6=assetLife, D7=method, D8=residual; row 31 = period index; row 30 = assetYearCounter (same as here).
    // SLM: (-SUM($D$35:$H$35)-D8)/D6 per active column; we use (depreciableBase-residual)/assetLife (depreciableBase = total depreciable CAPEX).
    // DDB: 2*beginningBook/D6; row 49 beginning book = -SUM($D$35:$H$35)-prior cumulative (see beginningBookValue below).
    // SYD: (base-residual)*(D6-prevRow30)/(0.5*D6*(D6+1)); prevRow30 equals assetYearCounter-1 for the current column → same as (assetLife-(assetYearCounter-1))/denom.
    // Excel zeroes columns via IF(OR(D$5=…)) by column offset and IF(col>D6+D5-1); we use assetYearCounter in [1,assetLife] and !isPerpetuityColumn.
    // Note: xlsm SLM/SYD numerators use a fixed five-column CAPEX band D35:H35; app sums all capex[] — align if CAPEX is only in the first capexYears columns.
    let depreciation = 0;
    const currentBeginningBookValue = beginningBookValue;

    if (assetYearCounter >= 1 && assetYearCounter <= assetLife && !isPerpetuityColumn) {
      switch (depreciationMethod) {
        case 'SLM':
          depreciation = (depreciableBase - residualValue) / assetLife;
          break;
        case 'DDB':
          depreciation = (2 * currentBeginningBookValue) / assetLife;
          break;
        case 'SYD': {
          const sydDenominator = 0.5 * assetLife * (assetLife + 1);
          depreciation =
            (depreciableBase - residualValue) *
            (assetLife - (assetYearCounter - 1)) /
            sydDenominator;
          break;
        }
      }
    }

    // 12. Cumulative Depreciation
    cumulativeDepreciation += depreciation;

    // 13. Beginning Book Value for next year (update after recording current)
    // For current row, we already captured currentBeginningBookValue above
    beginningBookValue = depreciableBase - cumulativeDepreciation;

    // 14. Total Operating Profits
    const totalOperatingProfits = operatingCashFlows - depreciation;

    // 15. Corporation Tax
    // Match spreadsheet behavior:
    // - Regular columns: tax previous period operating profits.
    // - Perpetuity column: if current profit > 0, use current; otherwise fallback to previous.
    // Prior-period profit threshold (Excel differs by sheet layout):
    // - Master - Option to Delay: IF(AND(..., L48>0), ...) — strict > 0
    // - Master Option to Expand / Abandon: IF(AND(..., N47>-0.0001), ...) — epsilon band
    let corporationTax = 0;
    if (isPerpetuityColumn && totalOperatingProfits > 0) {
      corporationTax = totalOperatingProfits * taxRate;
    } else if (t > 0) {
      const prevOperatingProfits = yearResults[t - 1].totalOperatingProfits;
      if (prevOperatingProfits > 0) {
        corporationTax = prevOperatingProfits * taxRate;
      }
    }

    // 16. Post Tax Cashflow
    const postTaxCashflow = netCashFlows - corporationTax;

    // 17. Post Tax CF (+ve)
    const postTaxCashflowPositive = Math.max(postTaxCashflow, 0);

    // 18. Post Tax CF (-ve)
    const postTaxCashflowNegative = Math.min(postTaxCashflow, 0);

    // 19. Tax Present Value
    const taxPresentValue = waccDiscountFactor * corporationTax;

    // 20. Reinvestment Terminal Value (blank when perpetuity is included per spreadsheet)
    let reinvestmentTerminalValue: number = NaN;
    if (!includePerpetGgity) {
      reinvestmentTerminalValue = reinvestmentDiscountFactor * postTaxCashflowPositive;
    }

    // 21. MIRR Present Value (blank when perpetuity is included per spreadsheet)
    let mirrPresentValue: number = NaN;
    if (!includePerpetGgity) {
      mirrPresentValue = -waccDiscountFactor * postTaxCashflowNegative;
    }

    // 22. Post Tax PV
    const postTaxNonInvestmentCashflowPV =  netCashFlowPV - taxPresentValue - yearCapex * waccDiscountFactor - assetRecovery * waccDiscountFactor;

    // 23. Investments PV
    const investmentsPV = (yearCapex + assetRecovery) * waccDiscountFactor;

    yearResults.push({
      pvYear,
      assetYear: assetYearCounter,
      waccDiscountFactor,
      reinvestmentDiscountFactor,
      capex: yearCapex,
      assetRecovery,
      revenue: yearRevenue,
      costOfSales: yearCostOfSales,
      grossProfit,
      opex: yearOpex,
      operatingCashFlows,
      payables,
      receivables,
      changeInNetWorkingCapital,
      netCashFlows,
      netCashFlowPV,
      depreciation,
      cumulativeDepreciation: isPerpetuityColumn ? NaN : cumulativeDepreciation,
      beginningBookValue: pvYear === 0 ? NaN : (depreciationMethod === 'DDB' ? currentBeginningBookValue : NaN),
      totalOperatingProfits,
      corporationTax,
      postTaxCashflow,
      postTaxCashflowPositive,
      postTaxCashflowNegative,
      taxPresentValue,
      reinvestmentTerminalValue,
      mirrPresentValue,
      postTaxNonInvestmentCashflowPV,
      investmentsPV,
    });
  }

  // ============ Summary ============

  const sumNetCashFlowPV = yearResults.reduce((s, r) => s + r.netCashFlowPV, 0);
  const sumTaxPV = yearResults.reduce((s, r) => s + r.taxPresentValue, 0);
  const npv = sumNetCashFlowPV - sumTaxPV;

  // Investment (I) = -SUM(InvestmentsPV) for all years
  const investment = -yearResults.reduce((s, r) => s + r.investmentsPV, 0);

  // V0
  // Per spreadsheet: SUM of Post Tax PV excluding the first column (Y0).
  // (For Full/Delay, postTaxNonInvestmentCashflowPV already excludes investment PVs.)
  const v0 = yearResults.reduce(
    (s, r, i) => (i === 0 ? s : s + r.postTaxNonInvestmentCashflowPV),
    0,
  );

  // Base NPV = V0 - I
  const baseNPV = v0 - investment;

  // MIRR (not applicable when perpetuity is included — spreadsheet returns "N/A")
  let mirr: number | null = null;
  if (!includePerpetGgity) {
    const sumReinvestmentTV = yearResults.reduce((s, r) => s + r.reinvestmentTerminalValue, 0);
    const sumMIRRPV = yearResults.reduce((s, r) => s + r.mirrPresentValue, 0);
    if (sumMIRRPV !== 0) {
      mirr = Math.pow(sumReinvestmentTV / sumMIRRPV, 1 / (assetLife + capexYears)) - 1;
    }
  }

  // Base ROI
  const baseROI = investment !== 0 ? baseNPV / investment : 0;

  return {
    yearResults,
    summary: {
      npv,
      v0,
      investment,
      baseNPV,
      mirr,
      baseROI,
    },
  };
}

export function calculateVolatility(inputs: VolatilityInputs): number {
  const { base, downside, upside } = inputs;
  const avg = (base + downside + upside) / 3;
  return Math.sqrt(
    ((base - avg) ** 2 + (downside - avg) ** 2 + (upside - avg) ** 2) / 2
  );
}
