"use client";

import { useFinancialStore } from "../stores/financial-store-context";
import type { VolatilitySource, AssetSource, TimeStep } from "../types";
import { INDUSTRY_VOLATILITY_DATA } from "../data/industry-volatility";
import { DCFFormSection } from "./DCFFormSection";
// import { calculateRealOptionFactors } from "../engines/rov-common";
// import { formatCurrency } from "../utils/formatting";
import { NumericInput } from "./NumericInput";
import { CalculatorInputLabel } from "./CalculatorInputLabel";
import {
  OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE,
  OPTION_DATA_SOURCE_FOR_VOLATILITY,
} from "../constants";
import { DELAY_TOOLTIP_TEXT } from "../constants/tooltips";

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mt-5 mb-3 pb-1.5 border-b border-teal-200 dark:border-teal-800">
    {children}
  </h4>
);

export function OptionDelayTab({
  section = "all",
}: {
  section?: "dcf" | "rov" | "all";
}) {
  const store = useFinancialStore();
  const { delayInputs: inp, delayCalculatedVolatility } = store;
  const dcfAssetLife = store.delayDCFInputs.capitalProfile.assetLife;
  const effectiveAssetLife =
    inp.assetSource === OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput
      ? dcfAssetLife
      : Math.max(1, Math.round(inp.manualAssetLife || 1));
  const maxExercise = Math.max(1, effectiveAssetLife - 1);

  // Resolve values for display
  const dcfSummary = store.delayDCFResult?.summary ?? null;

  // Resolved V0 & I (what's actually used)
  const v0 =
    inp.assetSource === "Use DCF Output" && dcfSummary
      ? dcfSummary.v0
      : inp.manualV0;
  const investment =
    inp.assetSource === "Use DCF Output" && dcfSummary
      ? dcfSummary.investment
      : inp.manualI;

  // All 3 volatility values (always computed for display)
  const volCalculation = delayCalculatedVolatility;
  // const volDropdown = inp.volatilityDropdown;
  // const volManual = inp.volatilityEnterValue;

  // Resolved volatility (the one actually used)
  // const resolvedVolatility =
  //   inp.volatilitySource === "Calculation"
  //     ? volCalculation
  //     : inp.volatilitySource === "Dropdown Selection"
  //       ? volDropdown
  //       : volManual;

  // Compute lattice factors for display
  // const factors =
  //   resolvedVolatility > 0
  //     ? calculateRealOptionFactors(
  //         resolvedVolatility,
  //         inp.riskFreeRate,
  //         inp.timeStep,
  //         inp.optionExercise,
  //       )
  //     : null;

  return (
    <>
      {/* ============ DCF Section ============ */}
      {(section === "all" || section === "dcf") && (
        <DCFFormSection
          dcfInputs={store.delayDCFInputs}
          dcfResult={store.delayDCFResult}
          // volatilityInputs={store.delayVolatilityInputs}
          onUpdateCapitalProfile={store.updateDelayCapitalProfile}
          onUpdateFinancialMetrics={store.updateDelayFinancialMetrics}
          onUpdateWorkingCapital={store.updateDelayWorkingCapital}
          onUpdateYearlyCashFlow={store.updateDelayYearlyCashFlow}
          onUpdateVolatilityInputs={store.updateDelayVolatilityInputs}
        />
      )}

      {/* ============ Option to Delay Section ============ */}
      {(section === "all" || section === "rov") && (
        <>
          {/* Data Source for Volatility */}
          <SectionHeader>Data Source</SectionHeader>
          <div className="rov-form-levels-grid">
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Volatility"
                tooltip={DELAY_TOOLTIP_TEXT.volatility}
              />
              <select
                value={inp.volatilitySource}
                onChange={(e) =>
                  store.updateDelayInputs({
                    volatilitySource: e.target.value as VolatilitySource,
                  })
                }
              >
                <option value={OPTION_DATA_SOURCE_FOR_VOLATILITY.calculation}>
                  Calculation
                </option>
                <option
                  value={OPTION_DATA_SOURCE_FOR_VOLATILITY.dropdownSelection}
                >
                  Dropdown Selection
                </option>
                <option value={OPTION_DATA_SOURCE_FOR_VOLATILITY.enterValue}>
                  Enter Volatility Value
                </option>
              </select>
            </div>
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Asset &amp; Investment Data"
                tooltip={DELAY_TOOLTIP_TEXT.assetAndInvestmentData}
              />
              <select
                value={inp.assetSource}
                onChange={(e) =>
                  store.updateDelayInputs({
                    assetSource: e.target.value as AssetSource,
                  })
                }
              >
                <option
                  value={
                    OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput
                  }
                >
                  Use DCF Output
                </option>
                <option
                  value={
                    OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.enterPVData
                  }
                >
                  Enter Manually
                </option>
              </select>
            </div>
          </div>

          {/* Real Option Levers */}
          <SectionHeader>Real Option Levers</SectionHeader>
          <div className="rov-form-levels-grid">
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Present Value of Asset, V₀ (£m)"
                tooltip={DELAY_TOOLTIP_TEXT.presentValueAsset}
              />
              <NumericInput
                value={inp.assetSource === OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput ? v0 : inp.manualV0}
                min={0}
                step={1}
                readOnly={inp.assetSource === OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput}
                className={
                  inp.assetSource === OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput ? "rov-readonly" : ""
                }
                onChange={(e) =>
                  store.updateDelayInputs({
                    manualV0: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Present Value of Investment, I (£m)"
                tooltip={DELAY_TOOLTIP_TEXT.presentValueInvestment}
              />
              <NumericInput
                value={inp.assetSource === OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput ? investment : inp.manualI}
                min={0}
                step={1}
                readOnly={inp.assetSource === OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput}
                className={
                  inp.assetSource === OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput ? "rov-readonly" : ""
                }
                onChange={(e) =>
                  store.updateDelayInputs({
                    manualI: Number(e.target.value),
                  })
                }
              />
            </div>
            {inp.assetSource === OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.enterPVData && (
              <div className="rov-form-group">
                <CalculatorInputLabel
                  label="Project/Asset Life (years)"
                  tooltip={DELAY_TOOLTIP_TEXT.projectAssetLife}
                />
                <select
                  value={inp.manualAssetLife}
                  onChange={(e) =>
                    store.updateDelayInputs({
                      manualAssetLife: Math.max(
                        1,
                        Math.round(Number(e.target.value) || 1),
                      ),
                    })
                  }
                >
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="rov-form-levels-grid" style={{ marginTop: "0.75rem" }}>
            {inp.volatilitySource ===
              OPTION_DATA_SOURCE_FOR_VOLATILITY.calculation && (
              <div
                className={`rov-form-group ${inp.volatilitySource === OPTION_DATA_SOURCE_FOR_VOLATILITY.calculation ? "rov-field-active" : ""}`}
              >
                <CalculatorInputLabel
                  label="Calculation"
                  tooltip={DELAY_TOOLTIP_TEXT.volatilityCalculation}
                />
                <input
                  type="text"
                  value={
                    volCalculation > 0
                      ? `${(volCalculation * 100).toFixed(2)}%`
                      : "–"
                  }
                  readOnly
                  className="rov-readonly"
                />
              </div>
            )}
            {inp.volatilitySource ===
              OPTION_DATA_SOURCE_FOR_VOLATILITY.dropdownSelection && (
              <div
                className={`rov-form-group ${inp.volatilitySource === OPTION_DATA_SOURCE_FOR_VOLATILITY.dropdownSelection ? "rov-field-active" : ""}`}
              >
                <CalculatorInputLabel
                  label="Dropdown Selection"
                  tooltip={DELAY_TOOLTIP_TEXT.volatilityDropdown}
                />
                <select
                  value={inp.selectedIndustry ?? ""}
                  onChange={(e) => {
                    const industry = INDUSTRY_VOLATILITY_DATA.find(
                      (d) => d.industry === e.target.value,
                    );
                    store.updateDelayInputs({
                      selectedIndustry: e.target.value || null,
                      volatilityDropdown: industry?.stdDevEquity ?? 0,
                    });
                  }}
                >
                  <option value="">Select Industry</option>
                  {INDUSTRY_VOLATILITY_DATA.map((d) => (
                    <option key={d.industry} value={d.industry}>
                      {d.industry} ({(d.stdDevEquity * 100).toFixed(2)}%)
                    </option>
                  ))}
                </select>
              </div>
            )}
            {inp.volatilitySource ===
              OPTION_DATA_SOURCE_FOR_VOLATILITY.enterValue && (
              <div
                className={`rov-form-group ${inp.volatilitySource === OPTION_DATA_SOURCE_FOR_VOLATILITY.enterValue ? "rov-field-active" : ""}`}
              >
                <CalculatorInputLabel
                  label="Enter Volatility Value"
                  tooltip={DELAY_TOOLTIP_TEXT.volatilityManual}
                />
                <NumericInput
                  value={inp.volatilityEnterValue}
                  min={0.01}
                  max={2}
                  step={0.01}
                  onChange={(e) =>
                    store.updateDelayInputs({
                      volatilityEnterValue: Number(e.target.value),
                    })
                  }
                />
              </div>
            )}
            {inp.volatilitySource ===
              OPTION_DATA_SOURCE_FOR_VOLATILITY.calculation && (
              <>
                <div className="rov-form-group">
                  <CalculatorInputLabel
                    label="Downside"
                    tooltip={DELAY_TOOLTIP_TEXT.downside}
                  />
                  <NumericInput
                    value={store.delayVolatilityInputs.downside}
                    step={0.1}
                    onChange={(e) =>
                      store.updateDelayVolatilityInputs({
                        downside: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="rov-form-group">
                  <CalculatorInputLabel
                    label="Upside"
                    tooltip={DELAY_TOOLTIP_TEXT.upside}
                  />
                  <NumericInput
                    value={store.delayVolatilityInputs.upside}
                    step={0.1}
                    onChange={(e) =>
                      store.updateDelayVolatilityInputs({
                        upside: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </>
            )}
          </div>
          <div className="rov-form-levels-grid" style={{ marginTop: "0.75rem" }}>
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Option Exercise (years)"
                tooltip={DELAY_TOOLTIP_TEXT.optionExercise}
              />
              <select
                value={inp.optionExercise}
                onChange={(e) =>
                  store.updateDelayInputs({
                    optionExercise: Number(e.target.value),
                  })
                }
              >
                {Array.from({ length: maxExercise }, (_, i) => i + 1).map(
                  (v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Valuation Time Step"
                tooltip={DELAY_TOOLTIP_TEXT.valuationTimeStep}
              />
              <select
                value={inp.timeStep}
                onChange={(e) =>
                  store.updateDelayInputs({
                    timeStep: e.target.value as TimeStep,
                  })
                }
              >
                {inp.optionExercise <= 2 && (
                  <option value="Monthly">Monthly</option>
                )}
                {inp.optionExercise <= 4 && (
                  <option value="Bi-Monthly">Bi-Monthly</option>
                )}
                {inp.optionExercise <= 6 && (
                  <option value="Quarterly">Quarterly</option>
                )}
                {inp.optionExercise <= 12 && (
                  <option value="Half-Yearly">Half-Yearly</option>
                )}
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="rov-form-levels-grid" style={{ marginTop: "0.75rem" }}>
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Annual Risk-Free Rate r (%)"
                tooltip={DELAY_TOOLTIP_TEXT.riskFreeRate}
              />
              <input
                type="number"
                value={+(inp.riskFreeRate * 100).toFixed(2)}
                min={0}
                max={20}
                step={0.1}
                onChange={(e) =>
                  store.updateDelayInputs({
                    riskFreeRate: Number(e.target.value) / 100,
                  })
                }
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="rov-form-levels-grid" style={{ marginTop: "1.25rem" }}>
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Include Cost of Delay?"
                tooltip={DELAY_TOOLTIP_TEXT.includeCostOfDelay}
              />
              <select
                value={inp.includeCostOfDelay ? "Yes" : "No"}
                onChange={(e) =>
                  store.updateDelayInputs({
                    includeCostOfDelay: e.target.value === "Yes",
                  })
                }
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Include Future Value of Strike @ Exercise?"
                tooltip={DELAY_TOOLTIP_TEXT.includeFutureValueStrike}
              />
              <select
                value={inp.includeFVStrike ? "Yes" : "No"}
                onChange={(e) =>
                  store.updateDelayInputs({
                    includeFVStrike: e.target.value === "Yes",
                  })
                }
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </>
      )}
    </>
  );
}
