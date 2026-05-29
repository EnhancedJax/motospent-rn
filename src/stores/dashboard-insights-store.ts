import { create } from 'zustand';

import type { AverageSpendingPeriod, SpendingChartRange } from '@/core/dashboard/types';

export type AverageSpendingCategoryOption = {
  key: string;
  label: string;
  iconKey: string | null;
};

type DashboardInsightsState = {
  averageSpendingCategory: string;
  averageSpendingPeriod: AverageSpendingPeriod;
  spendingChartRange: SpendingChartRange;
  categoryOptions: AverageSpendingCategoryOption[];
  setAverageSpendingCategory: (key: string) => void;
  setAverageSpendingPeriod: (period: AverageSpendingPeriod) => void;
  setSpendingChartRange: (range: SpendingChartRange) => void;
  setCategoryOptions: (options: AverageSpendingCategoryOption[]) => void;
};

export const useDashboardInsightsStore = create<DashboardInsightsState>((set) => ({
  averageSpendingCategory: '',
  averageSpendingPeriod: 'week',
  spendingChartRange: '7d',
  categoryOptions: [],
  setAverageSpendingCategory: (key) => set({ averageSpendingCategory: key }),
  setAverageSpendingPeriod: (period) => set({ averageSpendingPeriod: period }),
  setSpendingChartRange: (range) => set({ spendingChartRange: range }),
  setCategoryOptions: (options) => set({ categoryOptions: options }),
}));
