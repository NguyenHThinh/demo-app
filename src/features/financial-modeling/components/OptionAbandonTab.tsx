"use client";

import { useFinancialStore } from "../stores/financial-store-context";
import type {
  VolatilitySource,
  AssetSource,
  TimeStep,
  AbandonRecoveryType,
} from "../types";
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
import { ABANDON_TOOLTIP_TEXT } from "../constants/tooltips";

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mt-5 mb-3 pb-1.5 border-b border-teal-200 dark:border-teal-800">
    {children}
  </h4>
);

export function OptionAbandonTab({
  section = "all",
}: {
  section?: "dcf" | "rov" | "all";
}) {
  const store = useFinancialStore();
  const { abandonInputs: inp, abandonCalculatedVolatility } = store;
  const dcfAssetLife = store.abandonDCFInputs.capitalProfile.assetLife;
  const effectiveAssetLife =
    inp.assetSource ===
    OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput
      ? dcfAssetLife
      : Math.max(1, Math.round(inp.manualAssetLife || 1));
  const maxExercise = Math.max(1, effectiveAssetLife - 1);

  // Resolved DCF summary
  const dcfSummary = store.abandonDCFResult?.summary ?? null;

  // Resolved V0 & I
  const v0 =
    inp.assetSource === "Use DCF Output" && dcfSummary
      ? dcfSummary.v0
      : inp.manualV0;
  const investment =
    inp.assetSource === "Use DCF Output" && dcfSummary
      ? dcfSummary.investment
      : inp.manualI;

  // Volatility values
  const volCalculation = abandonCalculatedVolatility;

  return (
    <>
      {/* ============ DCF Section ============ */}
      {(section === "all" || section === "dcf") && (
        <DCFFormSection
          dcfInputs={store.abandonDCFInputs}
          dcfResult={store.abandonDCFResult}
          // volatilityInputs={store.abandonVolatilityInputs}
          onUpdateCapitalProfile={store.updateAbandonCapitalProfile}
          onUpdateFinancialMetrics={store.updateAbandonFinancialMetrics}
          onUpdateWorkingCapital={store.updateAbandonWorkingCapital}
          onUpdateYearlyCashFlow={store.updateAbandonYearlyCashFlow}
          onUpdateVolatilityInputs={store.updateAbandonVolatilityInputs}
        />
      )}

      {/* ============ Option to Abandon Section ============ */}
      {(section === "all" || section === "rov") && (
        <>
          {/* Data Source for Volatility */}
          <SectionHeader>Data Source</SectionHeader>
          <div className="rov-form-levels-grid">
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Volatility"
                tooltip={ABANDON_TOOLTIP_TEXT.volatility}
              />
              <select
                value={inp.volatilitySource}
                onChange={(e) =>
                  store.updateAbandonInputs({
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
                tooltip={ABANDON_TOOLTIP_TEXT.assetAndInvestmentData}
              />
              <select
                value={inp.assetSource}
                onChange={(e) =>
                  store.updateAbandonInputs({
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
                tooltip={ABANDON_TOOLTIP_TEXT.presentValueAsset}
              />
              <NumericInput
                value={
                  inp.assetSource ===
                  OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput
                    ? v0
                    : inp.manualV0
                }
                min={0}
                step={1}
                readOnly={
                  inp.assetSource ===
                  OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput
                }
                className={
                  inp.assetSource ===
                  OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput
                    ? "rov-readonly"
                    : ""
                }
                onChange={(e) =>
                  store.updateAbandonInputs({
                    manualV0: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Present Value of Investment, I (£m)"
                tooltip={ABANDON_TOOLTIP_TEXT.presentValueInvestment}
              />
              <NumericInput
                value={
                  inp.assetSource ===
                  OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput
                    ? investment
                    : inp.manualI
                }
                min={0}
                step={1}
                readOnly={
                  inp.assetSource ===
                  OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput
                }
                className={
                  inp.assetSource ===
                  OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput
                    ? "rov-readonly"
                    : ""
                }
                onChange={(e) =>
                  store.updateAbandonInputs({
                    manualI: Number(e.target.value),
                  })
                }
              />
            </div>
            {inp.assetSource ===
              OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.enterPVData && (
              <div className="rov-form-group">
                <CalculatorInputLabel
                  label="Project/Asset Life (years)"
                  tooltip={ABANDON_TOOLTIP_TEXT.projectAssetLife}
                />
                <select
                  value={inp.manualAssetLife}
                  onChange={(e) =>
                    store.updateAbandonInputs({
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
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Abandon Recovery Value, R (£m)"
                tooltip={ABANDON_TOOLTIP_TEXT.abandonRecovery}
              />
              <NumericInput
                value={inp.abandonRecovery}
                min={0}
                step={1}
                onChange={(e) =>
                  store.updateAbandonInputs({
                    abandonRecovery: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Abandonment Cost, Ae (£m)"
                tooltip={ABANDON_TOOLTIP_TEXT.abandonCost}
              />
              <NumericInput
                value={inp.abandonCost}
                min={0}
                step={1}
                onChange={(e) =>
                  store.updateAbandonInputs({
                    abandonCost: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div
            className="rov-form-levels-grid"
            style={{ marginTop: "0.75rem" }}
          >
            {inp.volatilitySource ===
              OPTION_DATA_SOURCE_FOR_VOLATILITY.calculation && (
              <div
                className={`rov-form-group ${inp.volatilitySource === OPTION_DATA_SOURCE_FOR_VOLATILITY.calculation ? "rov-field-active" : ""}`}
              >
                <CalculatorInputLabel
                  label="Calculation"
                  tooltip={ABANDON_TOOLTIP_TEXT.volatilityCalculation}
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
                  tooltip={ABANDON_TOOLTIP_TEXT.volatilityDropdown}
                />
                <select
                  value={inp.selectedIndustry ?? ""}
                  onChange={(e) => {
                    const industry = INDUSTRY_VOLATILITY_DATA.find(
                      (d) => d.industry === e.target.value,
                    );
                    store.updateAbandonInputs({
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
                  tooltip={ABANDON_TOOLTIP_TEXT.volatilityManual}
                />
                <NumericInput
                  value={inp.volatilityEnterValue}
                  min={0.01}
                  max={2}
                  step={0.01}
                  onChange={(e) =>
                    store.updateAbandonInputs({
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
                    tooltip={ABANDON_TOOLTIP_TEXT.downside}
                  />
                  <NumericInput
                    value={store.abandonVolatilityInputs.downside}
                    step={0.1}
                    onChange={(e) =>
                      store.updateAbandonVolatilityInputs({
                        downside: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="rov-form-group">
                  <CalculatorInputLabel
                    label="Upside"
                    tooltip={ABANDON_TOOLTIP_TEXT.upside}
                  />
                  <NumericInput
                    value={store.abandonVolatilityInputs.upside}
                    step={0.1}
                    onChange={(e) =>
                      store.updateAbandonVolatilityInputs({
                        upside: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </>
            )}
          </div>
          <div
            className="rov-form-levels-grid"
            style={{ marginTop: "0.75rem" }}
          >
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Option Exercise (years)"
                tooltip={ABANDON_TOOLTIP_TEXT.optionExercise}
              />
              <select
                value={inp.optionExercise}
                onChange={(e) =>
                  store.updateAbandonInputs({
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
                tooltip={ABANDON_TOOLTIP_TEXT.valuationTimeStep}
              />
              <select
                value={inp.timeStep}
                onChange={(e) =>
                  store.updateAbandonInputs({
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
          <div
            className="rov-form-levels-grid"
            style={{ marginTop: "0.75rem" }}
          >
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Annual Risk-Free Rate r (%)"
                tooltip={ABANDON_TOOLTIP_TEXT.riskFreeRate}
              />
              <input
                type="number"
                value={+(inp.riskFreeRate * 100).toFixed(2)}
                min={0}
                max={20}
                step={0.1}
                onChange={(e) =>
                  store.updateAbandonInputs({
                    riskFreeRate: Number(e.target.value) / 100,
                  })
                }
              />
            </div>
          </div>

          {/* Recovery Value Type */}
          <div
            className="rov-form-levels-grid"
            style={{ marginTop: "1.25rem" }}
          >
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Value of Abandon Recovery?"
                tooltip={ABANDON_TOOLTIP_TEXT.recoveryType}
              />
              <select
                value={inp.recoveryType}
                onChange={(e) =>
                  store.updateAbandonInputs({
                    recoveryType: e.target.value as AbandonRecoveryType,
                  })
                }
              >
                <option value="Fixed Value">Fixed Value</option>
                <option value="Future Value">Future Value</option>
              </select>
            </div>
          </div>
        </>
      )}
    </>
  );
}
