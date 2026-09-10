export function formatCurrency(value: number, decimals = 2): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  if (value < 0) return `(${formatted})`;
  return formatted;
}

export function formatPercent(value: number | null, decimals = 2): string {
  if (value === null) return 'N/A';
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatFactor(value: number, decimals = 4): string {
  return value.toFixed(decimals);
}
