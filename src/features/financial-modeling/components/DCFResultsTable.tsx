'use client';

import type { DCFResult, DCFInputs, DCFYearResult } from '../types';
import { formatCurrency, formatFactor } from '../utils/formatting';
import { NumericInput } from './NumericInput';

export type DCFTableVariant = 'full' | 'expand';

interface DCFResultsTableProps {
  result: DCFResult;
  inputs: DCFInputs;
  onUpdateYearlyCashFlow: (field: keyof DCFInputs['yearlyCashFlow'], index: number, value: number) => void;
  variant?: DCFTableVariant;
}

const POSITIVE_ONLY_CASHFLOW_FIELDS = new Set<
  keyof DCFInputs['yearlyCashFlow']
>(['revenue', 'costOfSales', 'opex']);

function normalizeDcfCashflowInput(
  field: keyof DCFInputs['yearlyCashFlow'],
  raw: number,
): number {
  if (field === 'capex') {
    if (raw === 0) return 0;
    return -Math.abs(raw);
  }
  if (POSITIVE_ONLY_CASHFLOW_FIELDS.has(field)) {
    return Math.abs(raw);
  }
  return raw;
}

type RowDef = {
  key: keyof DCFYearResult | 'header_asset' | 'header_pv';
  label: string;
  type: 'input' | 'calc' | 'header';
  inputKey?: keyof DCFInputs['yearlyCashFlow'];
  format?: 'currency' | 'factor' | 'factor6';
  bold?: boolean;
  /** Hide value (show empty) at year 0 */
  emptyAtY0?: boolean;
  /** Always visible even when details are collapsed */
  alwaysVisible?: boolean;
};

const FULL_ROWS: RowDef[] = [
  { key: 'waccDiscountFactor', label: 'Discount Factor', type: 'calc', format: 'factor' },
  { key: 'reinvestmentDiscountFactor', label: 'Reinvestment Discount Factor', type: 'calc', format: 'factor' },
  { key: 'capex', label: 'CAPEX (£m)', type: 'input', inputKey: 'capex', alwaysVisible: true },
  { key: 'assetRecovery', label: 'Opportunity Cost (£m)', type: 'calc', alwaysVisible: true },
  { key: 'revenue', label: 'Sales Revenue (£m)', type: 'input', inputKey: 'revenue', alwaysVisible: true },
  { key: 'costOfSales', label: 'Cost of Sales (£m)', type: 'input', inputKey: 'costOfSales', alwaysVisible: true },
  { key: 'grossProfit', label: 'Net Revenues (£m)', type: 'calc', alwaysVisible: true },
  { key: 'opex', label: 'Operating/Additional Expenses (£m)', type: 'input', inputKey: 'opex', alwaysVisible: true },
  { key: 'operatingCashFlows', label: 'Operating Cash Flows (£m)', type: 'calc' },
  { key: 'payables', label: 'Payables (£m)', type: 'calc' },
  { key: 'receivables', label: 'Receivables (£m)', type: 'calc' },
  { key: 'changeInNetWorkingCapital', label: 'Change in Net Working Capital (£m)', type: 'calc', alwaysVisible: true },
  { key: 'netCashFlows', label: 'Net Cash Flows (£m)', type: 'calc', bold: true, alwaysVisible: true },
  { key: 'netCashFlowPV', label: 'Net Cash Flow PV (£m)', type: 'calc' },
  { key: 'depreciation', label: 'Asset Depreciation (£m)', type: 'calc', alwaysVisible: true },
  { key: 'cumulativeDepreciation', label: 'Cumulative Depreciated Value (£m)', type: 'calc' },
  { key: 'beginningBookValue', label: 'Beginning Book Value (£m)', type: 'calc', emptyAtY0: true },
  { key: 'totalOperatingProfits', label: 'Total Operating Profits (£m)', type: 'calc' },
  { key: 'corporationTax', label: 'Corporation Tax (£m)', type: 'calc', emptyAtY0: true, alwaysVisible: true },
  { key: 'postTaxCashflow', label: 'Post Tax Cashflow (£m)', type: 'calc', bold: true, alwaysVisible: true },
  { key: 'postTaxCashflowPositive', label: 'Post Tax CF (+ve) (£m)', type: 'calc' },
  { key: 'postTaxCashflowNegative', label: 'Post Tax CF (-ve) (£m)', type: 'calc' },
  { key: 'taxPresentValue', label: 'Tax Present Value (£m)', type: 'calc' },
  { key: 'reinvestmentTerminalValue', label: 'Reinvestment Terminal Value (£m)', type: 'calc' },
  { key: 'mirrPresentValue', label: 'MIRR Present Value (£m)', type: 'calc' },
  { key: 'postTaxNonInvestmentCashflowPV', label: 'Post Tax Cash Flow PV (£m)', type: 'calc', alwaysVisible: true },
  { key: 'investmentsPV', label: 'Investment / CAPEX Recovery PV (£m)', type: 'calc', alwaysVisible: true },
];

const EXPAND_ROWS: RowDef[] = [
  { key: 'waccDiscountFactor', label: 'Discount Factor', type: 'calc', format: 'factor' },
  { key: 'capex', label: 'CAPEX (£m)', type: 'input', inputKey: 'capex', alwaysVisible: true },
  { key: 'assetRecovery', label: 'Opportunity Cost (£m)', type: 'calc', alwaysVisible: true },
  { key: 'revenue', label: 'Base Sales Revenue (£m)', type: 'input', inputKey: 'revenue', alwaysVisible: true },
  { key: 'costOfSales', label: 'Cost of Sales (or goods sold) (£m)', type: 'input', inputKey: 'costOfSales', alwaysVisible: true },
  { key: 'grossProfit', label: 'Net Revenues (£m)', type: 'calc', alwaysVisible: true },
  { key: 'opex', label: 'Additional Expenses (£m)', type: 'input', inputKey: 'opex', alwaysVisible: true },
  { key: 'operatingCashFlows', label: 'Operating Cash Flows (£m)', type: 'calc' },
  { key: 'payables', label: 'Payables (£m)', type: 'calc' },
  { key: 'receivables', label: 'Receivables (£m)', type: 'calc' },
  { key: 'changeInNetWorkingCapital', label: 'Change in Net Working Capital (£m)', type: 'calc', alwaysVisible: true },
  { key: 'netCashFlows', label: 'Net Cash Flows (Not including any capex) (£m)', type: 'calc', bold: true, alwaysVisible: true },
  { key: 'netCashFlowPV', label: 'Pre-Tax Cash Flow PV (£m)', type: 'calc' },
  { key: 'depreciation', label: 'Asset Depreciation (for cashflow tax shield) (£m)', type: 'calc', alwaysVisible: true },
  { key: 'cumulativeDepreciation', label: 'Cumulative Depreciated Value (£m)', type: 'calc' },
  { key: 'beginningBookValue', label: 'Beginning Book Value (£m)', type: 'calc', emptyAtY0: true },
  { key: 'totalOperatingProfits', label: 'Total Operating Profits (£m)', type: 'calc' },
  { key: 'corporationTax', label: 'Corporation Tax (£m)', type: 'calc', emptyAtY0: true, alwaysVisible: true },
  { key: 'postTaxCashflow', label: 'Post Tax Cashflow (£m)', type: 'calc', bold: true, alwaysVisible: true },
  { key: 'taxPresentValue', label: 'Tax Present Value (£m)', type: 'calc' },
  { key: 'postTaxNonInvestmentCashflowPV', label: 'Post Tax Cash Flow PV (£m)', type: 'calc', emptyAtY0: true, alwaysVisible: true },
  { key: 'investmentsPV', label: 'Investment / CAPEX Recovery PV (£m)', type: 'calc', alwaysVisible: true },
];

function formatCell(value: number, format?: string, key?: string): string {
  if (isNaN(value)) return key === 'beginningBookValue' ? 'N/A' : '';
  if (format === 'factor' || format === 'factor6') {
    return formatFactor(value, format === 'factor6' ? 6 : 4);
  }
  return formatCurrency(value);
}

function getRowLabel(row: RowDef, isCostSavings: boolean, variant: DCFTableVariant): string {
  if (variant === 'full') {
    if (row.key === 'revenue') return isCostSavings ? 'Cost Savings (£m)' : 'Sales Revenue (£m)';
    if (row.key === 'grossProfit') return isCostSavings ? 'Cost Savings (£m)' : 'Net Revenues (£m)';
  }
  return row.label;
}

function getColumnKey(yr: DCFYearResult, idx: number, perpIdx: number): string {
  if (idx === perpIdx) return 'perp';
  return `col-${yr.assetYear}-${yr.pvYear}-${idx}`;
}

export function DCFResultsTable({ result, inputs, onUpdateYearlyCashFlow, variant = 'full' }: DCFResultsTableProps) {
  const { yearResults } = result;
  const isCostSavings = inputs.financialMetrics.financialOutcome === 'Cost Savings';
  const allRows = variant === 'expand' ? EXPAND_ROWS : FULL_ROWS;
  // Show all rows by default (no toggle Show/Hide Details).
  const rows = allRows.filter((r) => r.alwaysVisible);

  const capexYears = inputs.capitalProfile.capexYears;
  const perpIdx = inputs.financialMetrics.includePerpetGgity ? yearResults.length - 1 : -1;

  return (
    <>
      <div className="rov-dcf-table-wrapper">
        <table className="rov-dcf-table">
          <thead>
              <>
                <tr>
                  <th className="rov-row-label">Asset Year Counter</th>
                  {yearResults.map((yr, idx) => (
                    <th key={getColumnKey(yr, idx, perpIdx)}>
                      {idx === perpIdx ? 'Perp.' : yr.assetYear}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="rov-row-label">PV Year Counter</th>
                  {yearResults.map((yr, idx) => (
                    <th key={getColumnKey(yr, idx, perpIdx)}>
                      {idx === perpIdx ? 'Perp.' : yr.pvYear}
                    </th>
                  ))}
                </tr>
              </>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className={
                  row.type === 'input' ? 'rov-row-input' : row.bold ? 'rov-row-bold' : ''
                }
              >
                <td className="rov-row-label">{getRowLabel(row, isCostSavings, variant)}</td>
                {yearResults.map((yr, idx) => {
                  const isPerpCol = idx === perpIdx;
                  const cellKey = `${row.key}-${getColumnKey(yr, idx, perpIdx)}`;



                  // Perpetuity column
                  if (isPerpCol) {
                    // Revenue, COS, Opex are user-editable in perpetuity column
                    if (row.type === 'input' && row.inputKey && row.key !== 'capex') {
                      return (
                        <td key={cellKey}>
                          <NumericInput
                            value={inputs.yearlyCashFlow[row.inputKey][idx] ?? 0}
                            onChange={(e) =>
                              onUpdateYearlyCashFlow(
                                row.inputKey!,
                                idx,
                                normalizeDcfCashflowInput(
                                  row.inputKey!,
                                  parseFloat(e.target.value) || 0,
                                ),
                              )
                            }
                          />
                        </td>
                      );
                    }
                    // CAPEX is always 0 in perpetuity
                    if (row.key === 'capex') {
                      return <td key={cellKey}><span className="rov-readonly-cell">0.00</span></td>;
                    }
                    // Computed values
                    const rawVal = yr[row.key as keyof DCFYearResult] as number;
                    if (row.key === 'cumulativeDepreciation' && isNaN(rawVal)) return <td key={cellKey} />;
                    if (row.key === 'beginningBookValue' && isNaN(rawVal)) return <td key={cellKey}>N/A</td>;
                    return (
                      <td key={cellKey}>
                        <span className={rawVal < 0 ? 'rov-cell-negative' : ''}>
                          {formatCell(rawVal, row.format)}
                        </span>
                      </td>
                    );
                  }

                  // CAPEX: editable only within CAPEX period
                  if (row.key === 'capex' && row.type === 'input' && row.inputKey) {
                    if (idx < capexYears) {
                      return (
                        <td key={cellKey}>
                          <NumericInput
                            value={inputs.yearlyCashFlow[row.inputKey][idx] ?? 0}
                            onChange={(e) =>
                              onUpdateYearlyCashFlow(
                                row.inputKey!,
                                idx,
                                normalizeDcfCashflowInput(
                                  row.inputKey!,
                                  parseFloat(e.target.value) || 0,
                                ),
                              )
                            }
                          />
                        </td>
                      );
                    }
                    return <td key={cellKey}><span className="rov-readonly-cell">0.00</span></td>;
                  }

                  // Regular input rows
                  if (row.type === 'input' && row.inputKey) {
                    return (
                      <td key={cellKey}>
                        <NumericInput
                          value={inputs.yearlyCashFlow[row.inputKey][idx] ?? 0}
                          onChange={(e) =>
                            onUpdateYearlyCashFlow(
                              row.inputKey!,
                              idx,
                              normalizeDcfCashflowInput(
                                row.inputKey!,
                                parseFloat(e.target.value) || 0,
                              ),
                            )
                          }
                        />
                      </td>
                    );
                  }

                  if (row.emptyAtY0 && idx === 0) {
                    return <td key={cellKey} />;
                  }

                  const rawVal = yr[row.key as keyof DCFYearResult] as number;
                  if (row.key === 'beginningBookValue' && isNaN(rawVal)) {
                    return <td key={cellKey}>N/A</td>;
                  }

                  return (
                    <td key={cellKey}>
                      <span className={rawVal < 0 ? 'rov-cell-negative' : ''}>
                        {formatCell(rawVal, row.format)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DCF Summary */}
      {/* <div className="rov-info-grid" style={{ marginTop: '1rem' }}>
        {variant === 'full' && (
          <div className="rov-info-item">
            <span className="rov-info-label">NPV</span>
            <span className={`rov-info-value ${result.summary.npv >= 0 ? 'rov-positive' : 'rov-negative'}`}>
              {formatCurrency(result.summary.npv)}
            </span>
          </div>
        )}
        <div className="rov-info-item">
          <span className="rov-info-label">{variant === 'expand' ? 'PV, Current Asset, V₀ (£m)' : 'Present Value of Asset, V₀'}</span>
          <span className="rov-info-value">{formatCurrency(result.summary.v0)}</span>
        </div>
        <div className="rov-info-item">
          <span className="rov-info-label">{variant === 'expand' ? 'PV, Current Investment, I (£m)' : 'Present Value of Investment, I'}</span>
          <span className="rov-info-value">{formatCurrency(result.summary.investment)}</span>
        </div>
        <div className="rov-info-item">
          <span className="rov-info-label">{variant === 'expand' ? 'NPV of Current Investment' : 'Base NPV (V₀ − I)'}</span>
          <span className={`rov-info-value ${result.summary.baseNPV >= 0 ? 'rov-positive' : 'rov-negative'}`}>
            {formatCurrency(result.summary.baseNPV)}
          </span>
        </div>
        {variant === 'full' && (
          <div className="rov-info-item">
            <span className="rov-info-label">MIRR</span>
            <span className="rov-info-value">
              {result.summary.mirr != null ? (result.summary.mirr! * 100).toFixed(2) + '%' : '–'}
            </span>
          </div>
        )}
        <div className="rov-info-item">
          <span className="rov-info-label">{variant === 'expand' ? 'Current Investment ROI (%)' : 'Base ROI'}</span>
          <span className="rov-info-value">{(result.summary.baseROI * 100).toFixed(2)}%</span>
        </div>
      </div> */}
    </>
  );
}
