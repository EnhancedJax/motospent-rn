import { expensesRepository } from '@/core/database/repositories/expenses-repository';
import { motorcyclesRepository } from '@/core/database/repositories/motorcycles-repository';
import type { ExpenseDTO } from '@/core/database/types';

import { OdometerTimelineError } from '../errors/domain-errors';

type TimelinePoint = {
  date: number;
  createdAt: number;
};

function isBefore(a: TimelinePoint, b: TimelinePoint): boolean {
  if (a.date !== b.date) {
    return a.date < b.date;
  }
  return a.createdAt < b.createdAt;
}

function isAfter(a: TimelinePoint, b: TimelinePoint): boolean {
  if (a.date !== b.date) {
    return a.date > b.date;
  }
  return a.createdAt > b.createdAt;
}

function findNeighbors(
  expenses: ExpenseDTO[],
  candidate: TimelinePoint,
  excludeExpenseId?: string,
): { previous: ExpenseDTO | null; next: ExpenseDTO | null } {
  let previous: ExpenseDTO | null = null;
  let next: ExpenseDTO | null = null;

  for (const expense of expenses) {
    if (expense.id === excludeExpenseId) {
      continue;
    }

    const point: TimelinePoint = { date: expense.date, createdAt: expense.createdAt };
    if (isBefore(point, candidate)) {
      previous = expense;
      continue;
    }
    if (isAfter(point, candidate)) {
      next = expense;
      break;
    }
  }

  return { previous, next };
}

export type LatestOdometerReading = {
  odometerKm: number;
  recordedAt: number;
};

export type OdometerBoundsKm = {
  minKm: number;
  maxKm: number | null;
  suggestedKm: number;
};

export const odometerEngine = {
  async getLatestOdometerKm(motorcycleId: string): Promise<number> {
    const reading = await odometerEngine.getLatestOdometerReading(motorcycleId);
    return reading.odometerKm;
  },

  async getLatestOdometerReading(motorcycleId: string): Promise<LatestOdometerReading> {
    const latestExpense = await expensesRepository.findLatestByMotorcycleId(motorcycleId);
    if (latestExpense) {
      return {
        odometerKm: latestExpense.odometerKm,
        recordedAt: latestExpense.date,
      };
    }

    const motorcycle = await motorcyclesRepository.findById(motorcycleId);
    if (!motorcycle) {
      throw new OdometerTimelineError(`Motorcycle not found: ${motorcycleId}`);
    }

    return {
      odometerKm: motorcycle.odometerAtAdditionKm,
      recordedAt: motorcycle.createdAt,
    };
  },

  async validateOdometerForExpense(params: {
    motorcycleId: string;
    date: number;
    odometerKm: number;
    expenseId?: string;
    createdAt?: number;
  }): Promise<void> {
    const { motorcycleId, date, odometerKm, expenseId } = params;

    const motorcycle = await motorcyclesRepository.findById(motorcycleId);
    if (!motorcycle) {
      throw new OdometerTimelineError(`Motorcycle not found: ${motorcycleId}`);
    }

    if (odometerKm < motorcycle.odometerAtAdditionKm) {
      throw new OdometerTimelineError(
        `Odometer cannot be below the motorcycle baseline (${motorcycle.odometerAtAdditionKm} km)`,
      );
    }

    let createdAt = params.createdAt;
    if (createdAt === undefined) {
      if (expenseId) {
        const existing = await expensesRepository.findById(expenseId);
        if (!existing) {
          throw new OdometerTimelineError(`Expense not found: ${expenseId}`);
        }
        createdAt = existing.createdAt;
      } else {
        createdAt = Date.now();
      }
    }

    const expenses = await expensesRepository.findAllForMotorcycleSorted(motorcycleId);
    const candidate: TimelinePoint = { date, createdAt };
    const { previous, next } = findNeighbors(expenses, candidate, expenseId);

    if (previous && odometerKm < previous.odometerKm) {
      throw new OdometerTimelineError(
        `Odometer (${odometerKm} km) cannot be less than a prior expense on ${new Date(previous.date).toISOString().slice(0, 10)} (${previous.odometerKm} km)`,
      );
    }

    if (next && odometerKm > next.odometerKm) {
      throw new OdometerTimelineError(
        `Odometer (${odometerKm} km) cannot exceed a later expense on ${new Date(next.date).toISOString().slice(0, 10)} (${next.odometerKm} km)`,
      );
    }
  },

  async getOdometerBoundsForExpense(params: {
    motorcycleId: string;
    date: number;
    expenseId?: string;
    createdAt?: number;
    currentOdometerKm?: number;
  }): Promise<OdometerBoundsKm> {
    const { motorcycleId, date, expenseId } = params;

    const motorcycle = await motorcyclesRepository.findById(motorcycleId);
    if (!motorcycle) {
      throw new OdometerTimelineError(`Motorcycle not found: ${motorcycleId}`);
    }

    let createdAt = params.createdAt;
    if (createdAt === undefined) {
      if (expenseId) {
        const existing = await expensesRepository.findById(expenseId);
        if (!existing) {
          throw new OdometerTimelineError(`Expense not found: ${expenseId}`);
        }
        createdAt = existing.createdAt;
      } else {
        createdAt = Date.now();
      }
    }

    const expenses = await expensesRepository.findAllForMotorcycleSorted(motorcycleId);
    const candidate: TimelinePoint = { date, createdAt };
    const { previous, next } = findNeighbors(expenses, candidate, expenseId);

    let minKm = Math.max(
      motorcycle.odometerAtAdditionKm,
      previous?.odometerKm ?? motorcycle.odometerAtAdditionKm,
    );
    let maxKm = next?.odometerKm ?? null;

    if (expenseId) {
      const existing = await expensesRepository.findById(expenseId);
      if (existing) {
        minKm = Math.min(minKm, existing.odometerKm);
        if (maxKm !== null) {
          maxKm = Math.max(maxKm, existing.odometerKm);
        }
      }
    }

    let suggestedKm: number;
    if (params.currentOdometerKm !== undefined && expenseId) {
      suggestedKm = params.currentOdometerKm;
    } else if (expenseId) {
      const existing = await expensesRepository.findById(expenseId);
      suggestedKm = existing?.odometerKm ?? minKm;
    } else {
      suggestedKm = await odometerEngine.getLatestOdometerKm(motorcycleId);
    }

    if (suggestedKm < minKm) {
      suggestedKm = minKm;
    }
    if (maxKm !== null && suggestedKm > maxKm) {
      suggestedKm = maxKm;
    }

    return { minKm, maxKm, suggestedKm };
  },

  async validateMotorcycleBaseline(motorcycleId: string, odometerAtAdditionKm: number): Promise<void> {
    const expenses = await expensesRepository.findAllForMotorcycleSorted(motorcycleId);
    if (expenses.length === 0) {
      return;
    }

    const minOdometer = Math.min(...expenses.map((e) => e.odometerKm));
    if (odometerAtAdditionKm > minOdometer) {
      throw new OdometerTimelineError(
        `Baseline odometer (${odometerAtAdditionKm} km) cannot exceed the lowest expense odometer (${minOdometer} km)`,
      );
    }
  },
};
