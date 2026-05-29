import { useEffect, useState } from 'react';

import { odometerEngine, type LatestOdometerReading } from '@/app-backend/odometer/odometer-engine';

export function useMotorcycleOdometer(motorcycleId: string | null) {
  const [reading, setReading] = useState<LatestOdometerReading | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!motorcycleId) {
      setReading(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void odometerEngine.getLatestOdometerReading(motorcycleId).then((result) => {
      if (!cancelled) {
        setReading(result);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [motorcycleId]);

  return { reading, isLoading };
}
