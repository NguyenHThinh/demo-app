"use client";

import type {
  DCFInputs,
  DCFResult,
  VolatilityInputs,
  DepreciationMethod,
  FinancialOutcome,
  PerpetualityType,
  ReinvestmentRateSource,
  YearlyCashFlowInput,
  CapitalProfile,
  FinancialMetrics,
  WorkingCapital,
} from "../types";
import { DCFResultsTable, type DCFTableVariant } from "./DCFResultsTable";
import { NumericInput } from "./NumericInput";
import { CalculatorInputLabel } from "./CalculatorInputLabel";
import { DCF_TOOLTIP_TEXT } from "../constants/tooltips";

interface DCFFormSectionProps {
  dcfInputs: DCFInputs;
  dcfResult: DCFResult | null;
  // volatilityInputs: VolatilityInputs;
  onUpdateCapitalProfile: (partial: Partial<CapitalProfile>) => void;
  onUpdateFinancialMetrics: (partial: Partial<FinancialMetrics>) => void;
  onUpdateWorkingCapital: (partial: Partial<WorkingCapital>) => void;
  onUpdateYearlyCashFlow: (
    field: keyof YearlyCashFlowInput,
    index: number,
    value: number,
  ) => void;
  onUpdateVolatilityInputs: (partial: Partial<VolatilityInputs>) => void;
  variant?: DCFTableVariant;
  // hideVolatility?: boolean;
}

function resolveReinvestmentRate(fm: FinancialMetrics): number {
  if (!fm.reinvestmentRateSource) return fm.reinvestmentRate;
  switch (fm.reinvestmentRateSource) {
    case "Risk Free Rate":
      return fm.reinvestmentRiskFreeRate ?? 0.05;
    case "WACC":
      return fm.wacc;
    case "Other":
      return fm.reinvestmentOtherRate ?? fm.reinvestmentRate;
  }
}

export function DCFFormSection({
  dcfInputs,
  dcfResult,
  // volatilityInputs,
  onUpdateCapitalProfile,
  onUpdateFinancialMetrics,
  onUpdateWorkingCapital,
  onUpdateYearlyCashFlow,
  // onUpdateVolatilityInputs,
  variant = "full",
  // hideVolatility = false,
}: DCFFormSectionProps) {
  const {
    capitalProfile: cp,
    financialMetrics: fm,
    workingCapital: wc,
  } = dcfInputs;
  const isExpand = variant === "expand";

  const handleReinvestmentSourceChange = (source: ReinvestmentRateSource) => {
    const rate = resolveReinvestmentRate({
      ...fm,
      reinvestmentRateSource: source,
    });
    onUpdateFinancialMetrics({
      reinvestmentRateSource: source,
      reinvestmentRate: rate,
    });
  };

  return (
    <>
      {/* Capital Investment Profile */}
      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mt-0 mb-3 pb-1.5 border-b border-teal-200 dark:border-teal-800">
        Capital Investment Profile
      </h4>
      <div className="rov-form-grid">
        <div className="rov-form-group">
          <CalculatorInputLabel
            label="Capex Investment (years)"
            tooltip={DCF_TOOLTIP_TEXT.capexInvestmentYears}
          />
          <select
            value={cp.capexYears}
            onChange={(e) =>
              onUpdateCapitalProfile({ capexYears: Number(e.target.value) })
            }
          >
            {[1, 2, 3, 4, 5].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="rov-form-group">
          <CalculatorInputLabel
            label="Asset Life"
            tooltip={DCF_TOOLTIP_TEXT.assetLife}
          />
          <select
            value={cp.assetLife}
            onChange={(e) =>
              onUpdateCapitalProfile({ assetLife: Number(e.target.value) })
            }
          >
            {Array.from({ length: 25 }, (_, i) => i + 1).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="rov-form-group">
          <CalculatorInputLabel
            label="Asset Depreciation"
            tooltip={DCF_TOOLTIP_TEXT.assetDepreciation}
          />
          <select
            value={cp.depreciationMethod}
            onChange={(e) =>
              onUpdateCapitalProfile({
                depreciationMethod: e.target.value as DepreciationMethod,
              })
            }
          >
            <option value="SLM">SLM - Straight Line</option>
            <option value="DDB">DDB - Double Declining</option>
            <option value="SYD">SYD - Sum of Years</option>
          </select>
        </div>
        {/* {isExpand && (
          <div className="rov-form-group">
            <label>Total Equipment &amp; Asset CAPEX (£m)</label>
            <NumericInput
              value={
                Math.abs(dcfInputs.yearlyCashFlow.capex[0] ?? 0) -
                cp.nonDepreciatingAsset
              }
              readOnly
              className="rov-readonly"
            />
          </div>
        )} */}
        <div className="rov-form-group">
          <CalculatorInputLabel
            label="Asset Residual Value (£m)"
            tooltip={DCF_TOOLTIP_TEXT.assetResidualValue}
          />
          <NumericInput
            value={cp.residualValue}
            step={1}
            onChange={(e) =>
              onUpdateCapitalProfile({ residualValue: Number(e.target.value) })
            }
          />
        </div>

        <div className="rov-form-group">
          <CalculatorInputLabel
            label="Non-depreciating Asset (£m)"
            tooltip={DCF_TOOLTIP_TEXT.nonDepreciatingAsset}
          />
          <NumericInput
            value={cp.nonDepreciatingAsset}
            step={1}
            onChange={(e) =>
              onUpdateCapitalProfile({
                nonDepreciatingAsset: Number(e.target.value),
              })
            }
          />
        </div>
      </div>

      {/* Financial Metrics */}
      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mt-5 mb-3 pb-1.5 border-b border-teal-200 dark:border-teal-800">
        Financial Metrics
      </h4>
      <div className="rov-form-grid">
        {!isExpand && (
          <div className="rov-form-group">
            <CalculatorInputLabel
              label="Financial Outcome"
              tooltip={DCF_TOOLTIP_TEXT.financialOutcome}
            />
            <select
              value={fm.financialOutcome}
              onChange={(e) =>
                onUpdateFinancialMetrics({
                  financialOutcome: e.target.value as FinancialOutcome,
                })
              }
            >
              <option value="Revenue">Revenue Growth</option>
              <option value="Cost Savings">Cost Saving</option>
            </select>
          </div>
        )}
        <div className="rov-form-group">
          <CalculatorInputLabel
            label="Discount Rate (%)"
            tooltip={DCF_TOOLTIP_TEXT.discountRate}
          />
          <input
            type="number"
            value={+(fm.wacc * 100).toFixed(2)}
            min={0}
            max={100}
            step={0.1}
            onChange={(e) => {
              const newWacc = Number(e.target.value) / 100;
              const updates: Partial<FinancialMetrics> = { wacc: newWacc };
              if (fm.reinvestmentRateSource === "WACC")
                updates.reinvestmentRate = newWacc;
              onUpdateFinancialMetrics(updates);
            }}
          />
        </div>
        <div className="rov-form-group">
          <CalculatorInputLabel
            label="Profit Tax Rate (%)"
            tooltip={DCF_TOOLTIP_TEXT.profitTaxRate}
          />
          <input
            type="number"
            value={+(fm.taxRate * 100).toFixed(2)}
            min={0}
            max={100}
            step={0.1}
            onChange={(e) =>
              onUpdateFinancialMetrics({
                taxRate: Number(e.target.value) / 100,
              })
            }
          />
        </div>
        <div className="rov-form-group">
          <CalculatorInputLabel
            label="Re-investment Rate (%)"
            tooltip={DCF_TOOLTIP_TEXT.reinvestmentRate}
          />
          <input
            type="number"
            value={+(fm.reinvestmentRate * 100).toFixed(2)}
            min={0}
            max={100}
            step={0.1}
            onChange={(e) =>
              onUpdateFinancialMetrics({
                reinvestmentRate: Number(e.target.value) / 100,
              })
            }
          />
        </div>
        <div className="rov-form-group">
          <CalculatorInputLabel
            label="Include Perpetuity"
            tooltip={DCF_TOOLTIP_TEXT.includePerpetuity}
          />
          <select
            value={fm.includePerpetGgity ? "Yes" : "No"}
            onChange={(e) =>
              onUpdateFinancialMetrics({
                includePerpetGgity: e.target.value === "Yes",
              })
            }
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
        {fm.includePerpetGgity && (
          <div className="rov-form-group">
            <CalculatorInputLabel
              label="Perpetuity Type"
              tooltip={DCF_TOOLTIP_TEXT.perpetuityType}
            />
            <select
              value={fm.perpetuityType}
              onChange={(e) =>
                onUpdateFinancialMetrics({
                  perpetuityType: e.target.value as PerpetualityType,
                })
              }
            >
              <option value="Growing">Growing</option>
              <option value="Constant">Constant</option>
            </select>
          </div>
        )}
        {fm.includePerpetGgity && fm.perpetuityType === "Growing" && (
          <div className="rov-form-group">
            <CalculatorInputLabel
              label="Perpetuity Growth Rate (%)"
              tooltip={DCF_TOOLTIP_TEXT.perpetuityGrowthRate}
            />
            <input
              type="number"
              value={+(fm.perpetuityGrowthRate * 100).toFixed(2)}
              step={0.1}
              onChange={(e) =>
                onUpdateFinancialMetrics({
                  perpetuityGrowthRate: Number(e.target.value) / 100,
                })
              }
            />
          </div>
        )}
      </div>

      {/* Working Capital Rule */}
      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mt-5 mb-3 pb-1.5 border-b border-teal-200 dark:border-teal-800">
        Working Capital Rule
      </h4>
      <div className="rov-form-grid">
        <div className="rov-form-group">
          <CalculatorInputLabel
            label="Percent Collected in Same Year (%)"
            tooltip={DCF_TOOLTIP_TEXT.percentCollectedSameYear}
          />
          <input
            type="number"
            value={+(wc.percentCollected * 100).toFixed(0)}
            min={0}
            max={100}
            step={5}
            onChange={(e) =>
              onUpdateWorkingCapital({
                percentCollected: Number(e.target.value) / 100,
              })
            }
          />
        </div>
        <div className="rov-form-group">
          <CalculatorInputLabel
            label="Percent Cost of Sales Paid in Same Year (%)"
            tooltip={DCF_TOOLTIP_TEXT.percentCostPaidSameYear}
          />
          <input
            type="number"
            value={+(wc.percentCostPaid * 100).toFixed(0)}
            min={0}
            max={100}
            step={5}
            onChange={(e) =>
              onUpdateWorkingCapital({
                percentCostPaid: Number(e.target.value) / 100,
              })
            }
          />
        </div>
      </div>

      {/* DCF Results Table */}
      {dcfResult && (
        <>
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mt-5 mb-3 pb-1.5 border-b border-teal-200 dark:border-teal-800">
            Discounted Cashflow Table
          </h4>
          <DCFResultsTable
            result={dcfResult}
            inputs={dcfInputs}
            onUpdateYearlyCashFlow={onUpdateYearlyCashFlow}
            variant={variant}
          />
        </>
      )}

      {/* Cashflow Volatility */}
      {/* {!hideVolatility && (
        <>
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mt-5 mb-3 pb-1.5 border-b border-teal-200 dark:border-teal-800">
            Cashflow Volatility
          </h4>
          <div className="rov-form-grid">
            <div className="rov-form-group">
              <label>Base Case</label>
              <NumericInput value={volatilityInputs.base} readOnly className="rov-readonly" />
            </div>
            <div className="rov-form-group">
              <label>Downside</label>
              <NumericInput value={volatilityInputs.downside} step={0.1} onChange={(e) => onUpdateVolatilityInputs({ downside: Number(e.target.value) })} />
            </div>
            <div className="rov-form-group">
              <label>Upside</label>
              <NumericInput value={volatilityInputs.upside} step={0.1} onChange={(e) => onUpdateVolatilityInputs({ upside: Number(e.target.value) })} />
            </div>
          </div>
        </>
      )} */}
    </>
  );
}
