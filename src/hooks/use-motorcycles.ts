import { useEffect, useState } from 'react';

import { motorcyclesService } from '@/app-backend';
import type { MotorcycleDTO } from '@/core/database/types';
import { subscribeObservable } from '@/stores/subscribe-observable';

export function useMotorcycles() {
  const [motorcycles, setMotorcycles] = useState<MotorcycleDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeObservable(motorcyclesService.observeList(), (list) => {
      setMotorcycles(list);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  return { motorcycles, isLoading };
}
