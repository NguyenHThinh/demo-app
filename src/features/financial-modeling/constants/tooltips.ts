export const DELAY_TOOLTIP_TEXT = {
  volatility:
    "Select the volatility data source used in option valuation.",
  assetAndInvestmentData:
    "Choose whether V0 and I are sourced from DCF output or entered manually.",
  presentValueAsset:
    "Present value of the underlying asset (V0), in million GBP.",
  presentValueInvestment:
    "Present value of the investment amount (I), in million GBP.",
  projectAssetLife:
    "Project or asset life in years, used to bound option exercise timing.",
  volatilityCalculation:
    "Volatility calculated automatically from DCF cashflow inputs.",
  volatilityDropdown:
    "Use an industry benchmark equity volatility from the lookup dataset.",
  volatilityManual:
    "Enter a custom volatility assumption directly.",
  downside:
    "Downside scenario adjustment used in volatility estimation.",
  upside:
    "Upside scenario adjustment used in volatility estimation.",
  optionExercise:
    "Year when the delay option is exercised.",
  valuationTimeStep:
    "Time granularity used in the binomial lattice (monthly, quarterly, yearly).",
  riskFreeRate:
    "Annual risk-free rate used for discounting in option valuation.",
  includeCostOfDelay:
    "Include opportunity cost associated with delaying the investment decision.",
  includeFutureValueStrike:
    "Use future value of strike at exercise instead of present value.",
} as const;

export const EXPAND_TOOLTIP_TEXT = {
  volatility:
    "Select the volatility data source used in option valuation.",
  assetAndInvestmentData:
    "Choose the current project V0 and I source: DCF output or manual input.",
  expansionAndInvestmentData:
    "Choose the expansion project V0e and Ie source: DCF output or manual input.",
  pvCurrentAsset:
    "Present value of current project asset (V0), in million GBP.",
  pvCurrentInvestment:
    "Present value of current project investment (I), in million GBP.",
  pvExpansionAsset:
    "Present value of expansion asset (V0e), in million GBP.",
  pvExpansionInvestment:
    "Present value of expansion investment (Ie), in million GBP.",
  projectAssetLife:
    "Expansion asset life in years, used to bound option exercise timing.",
  volatilityCalculation:
    "Volatility calculated automatically from DCF cashflow inputs.",
  volatilityDropdown:
    "Use an industry benchmark equity volatility from the lookup dataset.",
  volatilityManual:
    "Enter a custom volatility assumption directly.",
  downside:
    "Downside scenario adjustment used in volatility estimation.",
  upside:
    "Upside scenario adjustment used in volatility estimation.",
  optionExercise:
    "Year when the expansion option is exercised.",
  valuationTimeStep:
    "Time granularity used in the binomial lattice (monthly, quarterly, yearly).",
  riskFreeRate:
    "Annual risk-free rate used for discounting in option valuation.",
  includeCostOfDelay:
    "Include cost impact from delaying the expansion decision.",
  includeFutureValueStrike:
    "Use future value of expansion investment (Ie) at exercise instead of present value.",
} as const;

export const ABANDON_TOOLTIP_TEXT = {
  volatility:
    "Select the volatility data source used in option valuation.",
  assetAndInvestmentData:
    "Choose whether V0 and I are sourced from DCF output or entered manually.",
  presentValueAsset:
    "Present value of the underlying asset (V0), in million GBP.",
  presentValueInvestment:
    "Present value of the investment amount (I), in million GBP.",
  projectAssetLife:
    "Project or asset life in years, used to bound option exercise timing.",
  abandonRecovery:
    "Recovery value realized when the project is abandoned.",
  abandonCost:
    "Cost incurred when abandoning or exiting the project.",
  volatilityCalculation:
    "Volatility calculated automatically from DCF cashflow inputs.",
  volatilityDropdown:
    "Use an industry benchmark equity volatility from the lookup dataset.",
  volatilityManual:
    "Enter a custom volatility assumption directly.",
  downside:
    "Downside scenario adjustment used in volatility estimation.",
  upside:
    "Upside scenario adjustment used in volatility estimation.",
  optionExercise:
    "Year when the abandonment option is exercised.",
  valuationTimeStep:
    "Time granularity used in the binomial lattice (monthly, quarterly, yearly).",
  riskFreeRate:
    "Annual risk-free rate used for discounting in option valuation.",
  recoveryType:
    "Choose how recovery value is modeled: fixed value or future value.",
} as const;

export const DCF_TOOLTIP_TEXT = {
  capexInvestmentYears:
    "Number of years over which initial CAPEX is distributed.",
  assetLife:
    "Economic life of the asset or project used for cashflow horizon.",
  assetDepreciation:
    "Depreciation method applied to calculate annual accounting depreciation.",
  assetResidualValue:
    "Residual value of the asset at the end of asset life, in million GBP.",
  nonDepreciatingAsset:
    "Portion of asset value that is not depreciated (for example, land).",
  financialOutcome:
    "Model perspective: revenue growth or cost savings.",
  discountRate:
    "Discount rate (WACC) used to bring cashflows to present value.",
  profitTaxRate:
    "Corporate income tax rate applied to taxable profit.",
  reinvestmentRate:
    "Assumed reinvestment rate for growth and continuation value logic.",
  includePerpetuity:
    "Include terminal perpetuity value after the explicit forecast period.",
  perpetuityType:
    "Perpetuity model type: growing perpetuity or constant perpetuity.",
  perpetuityGrowthRate:
    "Long-term growth rate used when perpetuity type is Growing.",
  percentCollectedSameYear:
    "Percentage of revenue collected in the same year it is recognized.",
  percentCostPaidSameYear:
    "Percentage of cost of sales paid in the same year it is incurred.",
} as const;
