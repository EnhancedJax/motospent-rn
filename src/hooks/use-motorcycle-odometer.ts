import { useEffect, useState } from 'react';
import { switchMap } from 'rxjs/operators';
import { from } from 'rxjs';

import { expensesService } from '@/app-backend';
import { odometerEngine, type LatestOdometerReading } from '@/app-backend/odometer/odometer-engine';
import { subscribeObservable } from '@/stores/subscribe-observable';

export function useMotorcycleOdometer(motorcycleId: string | null) {
  const [reading, setReading] = useState<LatestOdometerReading | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!motorcycleId) {
      setReading(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const observable = expensesService.observeByMotorcycle(motorcycleId).pipe(
      switchMap(() => from(odometerEngine.getLatestOdometerReading(motorcycleId))),
    );

    const unsubscribe = subscribeObservable(observable, (result) => {
      setReading(result);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [motorcycleId]);

  return { reading, isLoading };
}
