"use client";

import { useFinancialStore } from "../stores/financial-store-context";
import type { VolatilitySource, AssetSource, TimeStep } from "../types";
import { INDUSTRY_VOLATILITY_DATA } from "../data/industry-volatility";
import { DCFFormSection } from "./DCFFormSection";
import { getExpandCurrentVIFromOriginalDCFGrid } from "../engines/dcf-engine";
// import { formatCurrency } from "../utils/formatting";
import { NumericInput } from "./NumericInput";
import { CalculatorInputLabel } from "./CalculatorInputLabel";
import {
  OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE,
  OPTION_DATA_SOURCE_FOR_EXPANSION_AND_INVESTMENT_VALUE,
  OPTION_DATA_SOURCE_FOR_VOLATILITY,
} from "../constants";
import { EXPAND_TOOLTIP_TEXT } from "../constants/tooltips";

export type ExpandSubView = "original" | "expansion";

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mt-5 mb-3 pb-1.5 border-b border-teal-200 dark:border-teal-800">
    {children}
  </h4>
);

interface OptionExpandTabProps {
  subView: ExpandSubView;
  onSubViewChange: (view: ExpandSubView) => void;
}

export function OptionExpandTab({
  subView,
  onSubViewChange,
  section = "all",
}: OptionExpandTabProps & { section?: "dcf" | "rov" | "all" }) {
  const store = useFinancialStore();
  const { expandInputs: inp, expandCalculatedVolatility } = store;
  const dcfExpansionAssetLife =
    store.expandExpansionDCFInputs.capitalProfile.assetLife;
  const effectiveExpansionAssetLife =
    inp.expansionSource ===
    OPTION_DATA_SOURCE_FOR_EXPANSION_AND_INVESTMENT_VALUE.useDCFOutput
      ? dcfExpansionAssetLife
      : Math.max(1, Math.round(inp.manualExpansionAssetLife || 1));

  // Resolved DCF summaries
  const expansionDCFSummary = store.expandExpansionDCFResult?.summary ?? null;

  // Resolved V0/I current (xlsm Expand (2) D88/D89: SUM row 58 / -SUM row 59 on Expand (1))
  const originalDCFGridVI =
    inp.currentSource === "Use DCF Output" && store.expandOriginalDCFResult
      ? getExpandCurrentVIFromOriginalDCFGrid(store.expandOriginalDCFResult)
      : null;
  const v0Current =
    originalDCFGridVI != null ? originalDCFGridVI.v0 : inp.manualV0Current;
  const iCurrent =
    originalDCFGridVI != null
      ? originalDCFGridVI.investment
      : inp.manualICurrent;

  // Resolved V0/I expansion
  const v0Expansion =
    inp.expansionSource === "Use DCF Output" && expansionDCFSummary
      ? expansionDCFSummary.v0
      : inp.manualV0Expansion;
  const iExpansion =
    inp.expansionSource === "Use DCF Output" && expansionDCFSummary
      ? expansionDCFSummary.investment
      : inp.manualIExpansion;

  // Volatility values
  const volCalculation = expandCalculatedVolatility;
  const volDropdown = inp.volatilityDropdown;
  const volManual = inp.volatilityEnterValue;
  const resolvedVolatility =
    inp.volatilitySource === "Calculation"
      ? volCalculation
      : inp.volatilitySource === "Dropdown Selection"
        ? volDropdown
        : volManual;

  // Lattice factors
  const maxExercise = Math.max(1, effectiveExpansionAssetLife - 1);


  return (
    <>
      {/* Sub-view toggle */}
      <div className="rov-sub-tabs">
        <button
          className={`rov-sub-tab ${subView === "original" ? "rov-sub-tab-active" : ""}`}
          onClick={() => onSubViewChange("original")}
        >
          Original Project Valuation
        </button>
        <button
          className={`rov-sub-tab ${subView === "expansion" ? "rov-sub-tab-active" : ""}`}
          onClick={() => onSubViewChange("expansion")}
        >
          Expansion Project &amp; Real Options
        </button>
      </div>

      {(section === "all" || section === "dcf") &&
        (subView === "original" ? (
          /* ============ Original Project DCF ============ */
          <DCFFormSection
            dcfInputs={store.expandOriginalDCFInputs}
            dcfResult={store.expandOriginalDCFResult}
            // volatilityInputs={store.expandVolatilityInputs}
            onUpdateCapitalProfile={store.updateExpandOriginalCapitalProfile}
            onUpdateFinancialMetrics={
              store.updateExpandOriginalFinancialMetrics
            }
            onUpdateWorkingCapital={store.updateExpandOriginalWorkingCapital}
            onUpdateYearlyCashFlow={store.updateExpandOriginalYearlyCashFlow}
            onUpdateVolatilityInputs={store.updateExpandVolatilityInputs}
            variant="expand"
            // hideVolatility
          />
        ) : (
          <>
            {/* ============ Expansion Project DCF ============ */}
            {/* <SectionHeader>Expansion Project Valuation</SectionHeader> */}
            <DCFFormSection
              dcfInputs={store.expandExpansionDCFInputs}
              dcfResult={store.expandExpansionDCFResult}
              // volatilityInputs={store.expandVolatilityInputs}
              onUpdateCapitalProfile={store.updateExpandExpansionCapitalProfile}
              onUpdateFinancialMetrics={
                store.updateExpandExpansionFinancialMetrics
              }
              onUpdateWorkingCapital={store.updateExpandExpansionWorkingCapital}
              onUpdateYearlyCashFlow={store.updateExpandExpansionYearlyCashFlow}
              onUpdateVolatilityInputs={store.updateExpandVolatilityInputs}
              variant="expand"
            />
          </>
        ))}

      {(section === "all" || section === "rov") && subView === "expansion" && (
        <>
          {/* ============ Option to Expand Section ============ */}

          {/* Data Source for Volatility */}
          <SectionHeader>Data Source</SectionHeader>
          <div className="rov-form-levels-grid">
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Volatility"
                tooltip={EXPAND_TOOLTIP_TEXT.volatility}
              />
              <select
                value={inp.volatilitySource}
                onChange={(e) =>
                  store.updateExpandInputs({
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

            {/* Data Source for Current Asset & Investment Value */}
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Asset &amp; Investment Data"
                tooltip={EXPAND_TOOLTIP_TEXT.assetAndInvestmentData}
              />
              <select
                value={inp.currentSource}
                onChange={(e) =>
                  store.updateExpandInputs({
                    currentSource: e.target.value as AssetSource,
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

            {/* Data Source for Expansion & Investment Value */}
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Expansion &amp; Investment Data"
                tooltip={EXPAND_TOOLTIP_TEXT.expansionAndInvestmentData}
              />
              <select
                value={inp.expansionSource}
                onChange={(e) =>
                  store.updateExpandInputs({
                    expansionSource: e.target.value as AssetSource,
                  })
                }
              >
                <option
                  value={
                    OPTION_DATA_SOURCE_FOR_EXPANSION_AND_INVESTMENT_VALUE.useDCFOutput
                  }
                >
                  Use DCF Output
                </option>
                <option
                  value={
                    OPTION_DATA_SOURCE_FOR_EXPANSION_AND_INVESTMENT_VALUE.enterPVData
                  }
                >
                  Enter PV Manually
                </option>
              </select>
            </div>
          </div>

          {/* Real Option Levers */}
          <SectionHeader>Real Option Levers</SectionHeader>
          <div className="rov-form-levels-grid">
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="PV, Current Asset, V₀ (£m)"
                tooltip={EXPAND_TOOLTIP_TEXT.pvCurrentAsset}
              />
              <NumericInput
                value={
                  inp.currentSource ===
                  OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput
                    ? v0Current
                    : inp.manualV0Current
                }
                min={0}
                step={1}
                readOnly={
                  inp.currentSource ===
                  OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput
                }
                className={
                  inp.currentSource ===
                  OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput
                    ? "rov-readonly"
                    : ""
                }
                onChange={(e) =>
                  store.updateExpandInputs({
                    manualV0Current: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="PV, Current Investment, I (£m)"
                tooltip={EXPAND_TOOLTIP_TEXT.pvCurrentInvestment}
              />
              <NumericInput
                value={
                  inp.currentSource ===
                  OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput
                    ? iCurrent
                    : inp.manualICurrent
                }
                min={0}
                step={1}
                readOnly={
                  inp.currentSource ===
                  OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput
                }
                className={
                  inp.currentSource ===
                  OPTION_DATA_SOURCE_FOR_ASSET_AND_INVESTMENT_VALUE.useDCFOutput
                    ? "rov-readonly"
                    : ""
                }
                onChange={(e) =>
                  store.updateExpandInputs({
                    manualICurrent: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="rov-form-group">
              <CalculatorInputLabel
                label={
                  <>
                    PV Expansion, V0<sub className="normal-case">e</sub> (£m)
                  </>
                }
                tooltip={EXPAND_TOOLTIP_TEXT.pvExpansionAsset}
              />
              <NumericInput
                value={
                  inp.expansionSource ===
                  OPTION_DATA_SOURCE_FOR_EXPANSION_AND_INVESTMENT_VALUE.useDCFOutput
                    ? v0Expansion
                    : inp.manualV0Expansion
                }
                min={0}
                step={1}
                readOnly={
                  inp.expansionSource ===
                  OPTION_DATA_SOURCE_FOR_EXPANSION_AND_INVESTMENT_VALUE.useDCFOutput
                }
                className={
                  inp.expansionSource ===
                  OPTION_DATA_SOURCE_FOR_EXPANSION_AND_INVESTMENT_VALUE.useDCFOutput
                    ? "rov-readonly"
                    : ""
                }
                onChange={(e) =>
                  store.updateExpandInputs({
                    manualV0Expansion: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="rov-form-group">
              <CalculatorInputLabel
                label={
                  <>
                    PV Expansion Investment, I
                    <sub className="normal-case">e</sub> (£m)
                  </>
                }
                tooltip={EXPAND_TOOLTIP_TEXT.pvExpansionInvestment}
              />
              <NumericInput
                value={
                  inp.expansionSource ===
                  OPTION_DATA_SOURCE_FOR_EXPANSION_AND_INVESTMENT_VALUE.useDCFOutput
                    ? iExpansion
                    : inp.manualIExpansion
                }
                min={0}
                step={1}
                readOnly={
                  inp.expansionSource ===
                  OPTION_DATA_SOURCE_FOR_EXPANSION_AND_INVESTMENT_VALUE.useDCFOutput
                }
                className={
                  inp.expansionSource ===
                  OPTION_DATA_SOURCE_FOR_EXPANSION_AND_INVESTMENT_VALUE.useDCFOutput
                    ? "rov-readonly"
                    : ""
                }
                onChange={(e) =>
                  store.updateExpandInputs({
                    manualIExpansion: Number(e.target.value),
                  })
                }
              />
            </div>
            {inp.expansionSource ===
              OPTION_DATA_SOURCE_FOR_EXPANSION_AND_INVESTMENT_VALUE.enterPVData && (
              <div className="rov-form-group">
                <CalculatorInputLabel
                  label="Project/Asset Life (years)"
                  tooltip={EXPAND_TOOLTIP_TEXT.projectAssetLife}
                />
                <select
                  value={inp.manualExpansionAssetLife}
                  onChange={(e) =>
                    store.updateExpandInputs({
                      manualExpansionAssetLife: Math.max(
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
          <div
            className="rov-form-levels-grid"
            style={{ marginTop: "0.75rem" }}
          >
            <div className="rov-form-group">
              {inp.volatilitySource ===
                OPTION_DATA_SOURCE_FOR_VOLATILITY.calculation && (
                <div
                  className={`rov-form-group ${inp.volatilitySource === "Calculation" ? "rov-field-active" : ""}`}
                >
                  <CalculatorInputLabel
                    label="Calculation"
                    tooltip={EXPAND_TOOLTIP_TEXT.volatilityCalculation}
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
                  className={`rov-form-group ${inp.volatilitySource === "Dropdown Selection" ? "rov-field-active" : ""}`}
                >
                  <CalculatorInputLabel
                    label="Dropdown Selection"
                    tooltip={EXPAND_TOOLTIP_TEXT.volatilityDropdown}
                  />
                  <select
                    value={inp.selectedIndustry ?? ""}
                    onChange={(e) => {
                      const industry = INDUSTRY_VOLATILITY_DATA.find(
                        (d) => d.industry === e.target.value,
                      );
                      store.updateExpandInputs({
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
                  className={`rov-form-group ${inp.volatilitySource === "Enter Value" ? "rov-field-active" : ""}`}
                >
                  <CalculatorInputLabel
                    label="Enter Volatility Value"
                    tooltip={EXPAND_TOOLTIP_TEXT.volatilityManual}
                  />
                  <NumericInput
                    value={inp.volatilityEnterValue}
                    min={0.01}
                    max={2}
                    step={0.01}
                    onChange={(e) =>
                      store.updateExpandInputs({
                        volatilityEnterValue: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}
            </div>
            {inp.volatilitySource ===
              OPTION_DATA_SOURCE_FOR_VOLATILITY.calculation && (
              <>
                <div className="rov-form-group">
                  <CalculatorInputLabel
                    label="Downside"
                    tooltip={EXPAND_TOOLTIP_TEXT.downside}
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
                    tooltip={EXPAND_TOOLTIP_TEXT.upside}
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
          <div
            className="rov-form-levels-grid"
            style={{ marginTop: "0.75rem" }}
          >
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Option Exercise (years)"
                tooltip={EXPAND_TOOLTIP_TEXT.optionExercise}
              />
              <select
                value={inp.optionExercise}
                onChange={(e) =>
                  store.updateExpandInputs({
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
                tooltip={EXPAND_TOOLTIP_TEXT.valuationTimeStep}
              />
              <select
                value={inp.timeStep}
                onChange={(e) =>
                  store.updateExpandInputs({
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
                tooltip={EXPAND_TOOLTIP_TEXT.riskFreeRate}
              />
              <input
                type="number"
                value={+(inp.riskFreeRate * 100).toFixed(2)}
                min={0}
                max={20}
                step={0.1}
                onChange={(e) =>
                  store.updateExpandInputs({
                    riskFreeRate: Number(e.target.value) / 100,
                  })
                }
              />
            </div>
            <div className="rov-form-group">
              <CalculatorInputLabel
                label="Include Cost of Delay?"
                tooltip={EXPAND_TOOLTIP_TEXT.includeCostOfDelay}
              />
              <select
                value={inp.includeCostOfDelay ? "Yes" : "No"}
                onChange={(e) =>
                  store.updateExpandInputs({
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
                label="Include Future Value of Investment @ Exercise?"
                tooltip={EXPAND_TOOLTIP_TEXT.includeFutureValueStrike}
              />
              <select
                value={inp.includeFVStrike ? "Yes" : "No"}
                onChange={(e) =>
                  store.updateExpandInputs({
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
