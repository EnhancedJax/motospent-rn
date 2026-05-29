import type { ExpenseDTO, StandardExpenseItemDTO } from '@/core/database/types';

import { getExpenseCategory } from './category-label';
import { isAnalyticsExpense } from './expense-filters';
import {
  daysAgoFromNow,
  formatDayLabel,
  formatMonthLabel,
  formatYearLabel,
  startOfDay,
  startOfMonth,
  startOfYear,
} from './period-buckets';
import type { ChartBarPoint, ChartPieSlice, SpendingChartRange, SpendingChartsResult } from './types';

const PIE_LABEL_THRESHOLD = 0.03;

function sumExpenses(expenses: ExpenseDTO[]): number {
  return expenses.reduce((acc, e) => acc + e.cost, 0);
}

function filterByDateRange(expenses: ExpenseDTO[], startMs: number, endMs: number): ExpenseDTO[] {
  return expenses.filter((e) => e.date >= startMs && e.date <= endMs);
}

function buildDailyBarData(expenses: ExpenseDTO[], days: number, now: number): ChartBarPoint[] {
  const startMs = daysAgoFromNow(days - 1, now);
  const endMs = startOfDay(now);
  const filtered = filterByDateRange(expenses, startMs, endMs);

  const buckets = new Map<number, number>();
  for (let i = 0; i < days; i++) {
    const dayMs = startMs + i * 24 * 60 * 60 * 1000;
    buckets.set(startOfDay(dayMs), 0);
  }

  for (const expense of filtered) {
    const day = startOfDay(expense.date);
    if (buckets.has(day)) {
      buckets.set(day, (buckets.get(day) ?? 0) + expense.cost);
    }
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([timestamp, value]) => ({
      label: formatDayLabel(timestamp),
      value,
    }));
}

function buildMonthlyBarData(expenses: ExpenseDTO[]): ChartBarPoint[] {
  const buckets = new Map<number, number>();
  for (const expense of expenses) {
    const month = startOfMonth(expense.date);
    buckets.set(month, (buckets.get(month) ?? 0) + expense.cost);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([timestamp, value]) => ({
      label: formatMonthLabel(timestamp),
      value,
    }));
}

function buildYearlyBarData(expenses: ExpenseDTO[]): ChartBarPoint[] {
  const buckets = new Map<number, number>();
  for (const expense of expenses) {
    const year = startOfYear(expense.date);
    buckets.set(year, (buckets.get(year) ?? 0) + expense.cost);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([timestamp, value]) => ({
      label: formatYearLabel(timestamp),
      value,
    }));
}

function buildPieData(
  expenses: ExpenseDTO[],
  catalogById: Map<string, StandardExpenseItemDTO>,
  chartColors: string[],
): ChartPieSlice[] {
  const buckets = new Map<string, { value: number; label: string; iconKey: string | null }>();

  for (const expense of expenses) {
    const category = getExpenseCategory(expense, catalogById);
    const existing = buckets.get(category.key);
    if (existing) {
      existing.value += expense.cost;
    } else {
      buckets.set(category.key, {
        value: expense.cost,
        label: category.label,
        iconKey: category.iconKey,
      });
    }
  }

  const total = [...buckets.values()].reduce((acc, b) => acc + b.value, 0);
  if (total === 0) {
    return [];
  }

  return [...buckets.values()]
    .sort((a, b) => b.value - a.value)
    .map((entry, index) => ({
      label: entry.label,
      value: entry.value,
      color: chartColors[index % chartColors.length],
      iconKey: entry.iconKey,
      showLabel: entry.value / total >= PIE_LABEL_THRESHOLD,
    }));
}

export function computeSpendingCharts(params: {
  expenses: ExpenseDTO[];
  catalogById: Map<string, StandardExpenseItemDTO>;
  range: SpendingChartRange;
  chartColors: string[];
  now?: number;
}): SpendingChartsResult {
  const { expenses, catalogById, range, chartColors, now = Date.now() } = params;
  const analyticsExpenses = expenses.filter(isAnalyticsExpense);

  let barData: ChartBarPoint[];
  let pieExpenses: ExpenseDTO[];
  let periodTotal: number;

  switch (range) {
    case '7d': {
      const startMs = daysAgoFromNow(6, now);
      const endMs = startOfDay(now) + 24 * 60 * 60 * 1000 - 1;
      pieExpenses = filterByDateRange(analyticsExpenses, startMs, endMs);
      barData = buildDailyBarData(analyticsExpenses, 7, now);
      periodTotal = sumExpenses(pieExpenses);
      break;
    }
    case '30d': {
      const startMs = daysAgoFromNow(29, now);
      const endMs = startOfDay(now) + 24 * 60 * 60 * 1000 - 1;
      pieExpenses = filterByDateRange(analyticsExpenses, startMs, endMs);
      barData = buildDailyBarData(analyticsExpenses, 30, now);
      periodTotal = sumExpenses(pieExpenses);
      break;
    }
    case 'month': {
      pieExpenses = analyticsExpenses;
      barData = buildMonthlyBarData(analyticsExpenses);
      periodTotal = barData.reduce((acc, b) => acc + b.value, 0);
      break;
    }
    case 'year': {
      pieExpenses = analyticsExpenses;
      barData = buildYearlyBarData(analyticsExpenses);
      periodTotal = barData.reduce((acc, b) => acc + b.value, 0);
      break;
    }
  }

  return {
    periodTotal,
    barData,
    pieData: buildPieData(pieExpenses, catalogById, chartColors),
  };
}
