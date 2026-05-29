import { useMemo, useState } from 'react';

import { buildCatalogMap, findFuelItemId } from '@/core/expense/expense-display';
import { getChartColors } from '@/theme/chart-colors';
import { computeAverageSpending } from '@/core/dashboard/average-spending';
import {
  ALL_CATEGORIES_KEY,
  discoverCategories,
  resolveDefaultCategoryKey,
} from '@/core/dashboard/category-label';
import { computeFuelEfficiency } from '@/core/dashboard/fuel-efficiency';
import { isAnalyticsExpense } from '@/core/dashboard/expense-filters';
import { computeMaintenanceRecency } from '@/core/dashboard/maintenance-recency';
import { computeOdometerTimeline } from '@/core/dashboard/odometer-timeline';
import { computeSpendingCharts } from '@/core/dashboard/spending-charts';
import type {
  AverageSpendingPeriod,
  SpendingChartRange,
} from '@/core/dashboard/types';

import { useExpenses } from './use-expenses';
import { useMaintenanceReminders } from './use-maintenance-reminders';
import { useMotorcycleOdometer } from './use-motorcycle-odometer';
import { useSettings } from './use-settings';
import { useStandardExpenseItems } from './use-standard-expense-items';
import { useTheme } from './use-theme';

export function useDashboardAnalytics(motorcycleId: string | null) {
  const theme = useTheme();
  const { expenses, isLoading: isLoadingExpenses } = useExpenses(motorcycleId);
  const { items: catalogItems, isLoading: isLoadingCatalog } = useStandardExpenseItems();
  const { reminders, isLoading: isLoadingReminders } = useMaintenanceReminders(motorcycleId);
  const { reading, isLoading: isLoadingOdometer } = useMotorcycleOdometer(motorcycleId);
  const { distanceUnit, volumeUnit, isLoading: isLoadingSettings } = useSettings();

  const [averageSpendingPeriod, setAverageSpendingPeriod] =
    useState<AverageSpendingPeriod>('week');
  const [averageSpendingCategory, setAverageSpendingCategory] = useState<string>('');
  const [spendingChartRange, setSpendingChartRange] = useState<SpendingChartRange>('7d');

  const distUnit = distanceUnit ?? 'km';
  const volUnit = volumeUnit ?? 'L';

  const catalogById = useMemo(() => buildCatalogMap(catalogItems), [catalogItems]);
  const fuelItemId = useMemo(() => findFuelItemId(catalogItems), [catalogItems]);

  const latestOdometerKm = reading?.odometerKm ?? 0;

  const chartColors = useMemo(() => getChartColors(theme), [theme]);

  const maintenanceRecency = useMemo(
    () =>
      computeMaintenanceRecency({
        expenses,
        catalogById,
        reminders,
        latestOdometerKm,
        distanceUnit: distUnit,
      }),
    [expenses, catalogById, reminders, latestOdometerKm, distUnit],
  );

  const fuelEfficiency = useMemo(
    () =>
      computeFuelEfficiency({
        expenses,
        fuelItemId,
        distanceUnit: distUnit,
        volumeUnit: volUnit,
      }),
    [expenses, fuelItemId, distUnit, volUnit],
  );

  const defaultCategoryKey = useMemo(() => {
    const analyticsExpenses = expenses.filter(isAnalyticsExpense);
    const categories = discoverCategories(analyticsExpenses, catalogById);
    return resolveDefaultCategoryKey(categories, fuelItemId, catalogById);
  }, [expenses, catalogById, fuelItemId]);

  const effectiveCategoryKey = averageSpendingCategory || defaultCategoryKey;

  const averageSpending = useMemo(
    () =>
      computeAverageSpending({
        expenses,
        catalogById,
        fuelItemId,
        period: averageSpendingPeriod,
        categoryKey: effectiveCategoryKey,
      }),
    [expenses, catalogById, fuelItemId, averageSpendingPeriod, effectiveCategoryKey],
  );

  const spendingCharts = useMemo(
    () =>
      computeSpendingCharts({
        expenses,
        catalogById,
        range: spendingChartRange,
        chartColors,
      }),
    [expenses, catalogById, spendingChartRange, chartColors],
  );

  const odometerTimeline = useMemo(
    () =>
      computeOdometerTimeline({
        expenses,
        distanceUnit: distUnit,
      }),
    [expenses, distUnit],
  );

  const categoryOptions = useMemo(() => {
    const analyticsExpenses = expenses.filter(isAnalyticsExpense);
    const categories = discoverCategories(analyticsExpenses, catalogById);
    return [
      { key: ALL_CATEGORIES_KEY, label: 'All categories' },
      ...categories.map((c) => ({ key: c.key, label: c.label })),
    ];
  }, [expenses, catalogById]);

  const isLoading =
    isLoadingExpenses ||
    isLoadingCatalog ||
    isLoadingReminders ||
    isLoadingSettings ||
    isLoadingOdometer;

  return {
    isLoading,
    distUnit,
    volUnit,
    catalogById,
    maintenanceRecency,
    fuelEfficiency,
    averageSpending,
    spendingCharts,
    odometerTimeline,
    averageSpendingPeriod,
    setAverageSpendingPeriod,
    averageSpendingCategory: effectiveCategoryKey,
    setAverageSpendingCategory,
    spendingChartRange,
    setSpendingChartRange,
    categoryOptions,
    chartColors,
  };
}
