'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '../utils/formatting';

interface SummaryItem {
  label: string;
  value: string;
  highlight?: boolean;
}

interface SummaryCardsProps {
  items: SummaryItem[];
}

export function SummaryCards({ items }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <Card
          key={item.label}
          className={item.highlight ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-950' : ''}
        >
          <CardContent className="py-3 px-4">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-lg font-bold tabular-nums">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DCFSummaryCards({ npv, mirr, baseNPV, baseROI, v0, investment }: {
  npv: number;
  mirr: number | null;
  baseNPV: number;
  baseROI: number;
  v0: number;
  investment: number;
}) {
  return (
    <SummaryCards
      items={[
        { label: 'NPV', value: `£${formatCurrency(npv)}m`, highlight: true },
        { label: 'MIRR', value: formatPercent(mirr) },
        { label: 'Base ROI', value: formatPercent(baseROI) },
        { label: 'PV of Asset (V0)', value: `£${formatCurrency(v0)}m` },
        { label: 'PV of Investment (I)', value: `£${formatCurrency(investment)}m` },
      ]}
    />
  );
}

export function ROVSummaryCards({ baseNPV, optionValue, expandedNPV, baseROI, rovROI, mirr }: {
  baseNPV: number;
  optionValue: number;
  expandedNPV: number;
  baseROI: number;
  rovROI: number;
  mirr?: number | null;
}) {
  const items: SummaryItem[] = [
    { label: 'Base NPV', value: `£${formatCurrency(baseNPV)}m` },
    { label: 'Option Value', value: `£${formatCurrency(optionValue)}m`, highlight: true },
    { label: 'Expanded NPV', value: `£${formatCurrency(expandedNPV)}m`, highlight: true },
    { label: 'Base ROI', value: formatPercent(baseROI) },
    { label: 'ROV ROI', value: formatPercent(rovROI) },
  ];
  if (mirr !== undefined) {
    items.splice(1, 0, { label: 'MIRR', value: formatPercent(mirr) });
  }
  return <SummaryCards items={items} />;
}
