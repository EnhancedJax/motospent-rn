import { useEffect, useState } from 'react';

import { expensesService } from '@/app-backend';
import type { ExpenseDTO } from '@/core/database/types';
import { subscribeObservable } from '@/stores/subscribe-observable';

export function useExpenses(motorcycleId: string | null) {
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!motorcycleId) {
      setExpenses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeObservable(
      expensesService.observeByMotorcycle(motorcycleId),
      (list) => {
        setExpenses(list);
        setIsLoading(false);
      },
    );
    return unsubscribe;
  }, [motorcycleId]);

  return { expenses, isLoading };
}
