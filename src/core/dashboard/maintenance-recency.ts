import type {
  ExpenseDTO,
  MaintenanceReminderDTO,
  StandardExpenseItemDTO,
} from '@/core/database/types';
import { fromStorageKm } from '@/core/units/distance';
import type { DistanceUnit } from '@/core/units/types';

import { compareExpensesNewestFirst, isMaintenanceRecencyExpense } from './expense-filters';
import type { MaintenanceBadge, MaintenanceRecencyItem, MaintenanceRecencyResult } from './types';

const SOON_THRESHOLD_KM = 100;
const DUE_THRESHOLD_KM = 10;

function getReminderThresholds(distanceUnit: DistanceUnit): { soon: number; due: number } {
  const soon = fromStorageKm(SOON_THRESHOLD_KM, distanceUnit);
  const due = fromStorageKm(DUE_THRESHOLD_KM, distanceUnit);
  return { soon, due };
}

function resolveBadge(
  mileageSinceDisplay: number,
  intervalDisplay: number,
  distanceUnit: DistanceUnit,
): MaintenanceBadge | null {
  if (intervalDisplay <= 0) {
    return null;
  }
  const { soon, due } = getReminderThresholds(distanceUnit);
  if (mileageSinceDisplay >= intervalDisplay - due) {
    return 'due';
  }
  if (mileageSinceDisplay >= intervalDisplay - soon) {
    return 'soon';
  }
  return null;
}

function findLatestExpenseForItem(expenses: ExpenseDTO[], standardItemId: string): ExpenseDTO | null {
  const matching = expenses
    .filter((e) => e.listedItemId === standardItemId)
    .sort(compareExpensesNewestFirst);
  return matching[0] ?? null;
}

export function computeMaintenanceRecency(params: {
  expenses: ExpenseDTO[];
  catalogById: Map<string, StandardExpenseItemDTO>;
  reminders: MaintenanceReminderDTO[];
  latestOdometerKm: number;
  distanceUnit: DistanceUnit;
}): MaintenanceRecencyResult {
  const { expenses, catalogById, reminders, latestOdometerKm, distanceUnit } = params;

  const remindersByItemId = new Map(reminders.map((r) => [r.standardItemId, r]));
  const maintenanceExpenses = expenses.filter((e) => isMaintenanceRecencyExpense(e, catalogById));

  if (maintenanceExpenses.length === 0) {
    return { kind: 'empty' };
  }

  const itemIds = new Set(
    maintenanceExpenses.map((e) => e.listedItemId).filter((id): id is string => id !== undefined),
  );

  const items: MaintenanceRecencyItem[] = [];

  for (const standardItemId of itemIds) {
    const catalogItem = catalogById.get(standardItemId);
    if (!catalogItem) {
      continue;
    }

    const lastService = findLatestExpenseForItem(maintenanceExpenses, standardItemId);
    if (!lastService) {
      continue;
    }

    const mileageSinceKm = Math.max(0, latestOdometerKm - lastService.odometerKm);
    const reminder = remindersByItemId.get(standardItemId);
    const intervalKm =
      reminder?.intervalDistanceKm ??
      (catalogItem.suggestDistanceKm > 0 ? catalogItem.suggestDistanceKm : 0);

    const mileageSinceDisplay = fromStorageKm(mileageSinceKm, distanceUnit);
    const intervalDisplay = fromStorageKm(intervalKm, distanceUnit);

    const progress =
      intervalKm > 0 ? Math.min(mileageSinceDisplay / intervalDisplay, 1) : null;

    items.push({
      standardItemId,
      name: catalogItem.name,
      iconKey: catalogItem.iconKey,
      mileageSinceKm,
      lastServiceDate: lastService.date,
      lastServiceOdometerKm: lastService.odometerKm,
      intervalKm,
      progress,
      badge: resolveBadge(mileageSinceDisplay, intervalDisplay, distanceUnit),
      reminderId: reminder?.id ?? null,
    });
  }

  if (items.length === 0) {
    return { kind: 'empty' };
  }

  items.sort((a, b) => b.mileageSinceKm - a.mileageSinceKm);
  return { kind: 'data', items: items.slice(0, 4) };
}
