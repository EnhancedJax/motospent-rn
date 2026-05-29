import { useEffect, useState } from 'react';

import { maintenanceRemindersService } from '@/app-backend';
import type { MaintenanceReminderDTO } from '@/core/database/types';
import { subscribeObservable } from '@/stores/subscribe-observable';

export function useMaintenanceReminders(motorcycleId: string | null) {
  const [reminders, setReminders] = useState<MaintenanceReminderDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!motorcycleId) {
      setReminders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeObservable(
      maintenanceRemindersService.observeByMotorcycle(motorcycleId),
      (list) => {
        setReminders(list);
        setIsLoading(false);
      },
    );
    return unsubscribe;
  }, [motorcycleId]);

  return { reminders, isLoading };
}
