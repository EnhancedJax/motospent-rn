import { useEffect, useState } from 'react';

import { standardExpenseItemsRepository } from '@/core/database/repositories/standard-expense-items-repository';
import type { StandardExpenseItemDTO } from '@/core/database/types';
import { subscribeObservable } from '@/stores/subscribe-observable';

export function useStandardExpenseItems() {
  const [items, setItems] = useState<StandardExpenseItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeObservable(standardExpenseItemsRepository.observeAll(), (list) => {
      setItems(list);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  return { items, isLoading };
}
