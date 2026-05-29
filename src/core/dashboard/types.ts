import type { StandardExpenseItemDTO } from '@/core/database/types';

export type MaintenanceBadge = 'soon' | 'due';

export type MaintenanceRecencyItem = {
  standardItemId: string;
  name: string;
  iconKey: string;
  mileageSinceKm: number;
  lastServiceDate: number;
  lastServiceOdometerKm: number;
  intervalKm: number;
  progress: number | null;
  badge: MaintenanceBadge | null;
  reminderId: string | null;
};

export type MaintenanceRecencyResult =
  | { kind: 'empty' }
  | { kind: 'data'; items: MaintenanceRecencyItem[] };

export type FuelInterval = {
  distance: number;
  volume: number;
  cost: number;
  distancePerVolume: number;
  costPerDistance: number;
};

export type FuelEfficiencyResult =
  | { kind: 'empty' }
  | {
      kind: 'data';
      intervalCount: number;
      distancePerVolume: { avg: number; min: number; max: number };
      costPerDistance: { avg: number; min: number; max: number };
    };

export type AverageSpendingPeriod = 'week' | 'month';

export type AverageSpendingResult = {
  categories: string[];
  defaultCategory: string;
  average: number;
  min: number | null;
  max: number | null;
  periodCount: number;
  periodLabel: 'weeks' | 'months';
};

export type SpendingChartRange = '7d' | '30d' | 'month' | 'year';

export type ChartBarPoint = {
  label: string;
  value: number;
};

export type ChartPieSlice = {
  label: string;
  value: number;
  color: string;
  iconKey: string | null;
  showLabel: boolean;
};

export type SpendingChartsResult = {
  periodTotal: number;
  barData: ChartBarPoint[];
  pieData: ChartPieSlice[];
};

export type OdometerTimelinePoint = {
  date: number;
  odometerDisplay: number;
  hasReading: boolean;
  label: string;
};

export type OdometerTimelineResult =
  | { kind: 'empty' }
  | { kind: 'single'; reading: number; date: number }
  | {
      kind: 'chart';
      points: OdometerTimelinePoint[];
      trendPoints: number[];
      avgDailyIncrease: number;
      showDataPoints: boolean;
    };

export type DashboardCatalogContext = {
  catalogById: Map<string, StandardExpenseItemDTO>;
  fuelItemId: string | undefined;
  maintenanceItemIds: Set<string>;
};
