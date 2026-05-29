import { standardExpenseItemsRepository } from '@/core/database/repositories/standard-expense-items-repository';
import { STANDARD_EXPENSE_ITEM_SEEDS } from '@/core/database/seed/standard-expense-item-seeds';
import type { StandardExpenseItemDTO } from '@/core/database/types';

export const standardExpenseItemsService = {
  async list(): Promise<StandardExpenseItemDTO[]> {
    return standardExpenseItemsRepository.findAll();
  },

  async getById(id: string): Promise<StandardExpenseItemDTO | null> {
    return standardExpenseItemsRepository.findById(id);
  },

  async seedDefaults(): Promise<void> {
    const count = await standardExpenseItemsRepository.count();
    if (count > 0) {
      return;
    }
    await standardExpenseItemsRepository.seed(STANDARD_EXPENSE_ITEM_SEEDS);
  },
};
