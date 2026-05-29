import { router } from 'expo-router';

export function openMaintenanceReminderForm(params: {
  motorcycleId: string;
  standardItemId: string;
}) {
  router.push({
    pathname: '/dashboard/maintenance-reminder-form',
    params: {
      motorcycleId: params.motorcycleId,
      standardItemId: params.standardItemId,
    },
  });
}
