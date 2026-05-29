import { router } from 'expo-router';

import {
  useDashboardInsightsStore,
  type AverageSpendingCategoryOption,
} from '@/stores/dashboard-insights-store';

export function openAverageSpendingCategorySheet(
  motorcycleId: string,
  categoryOptions: AverageSpendingCategoryOption[],
) {
  useDashboardInsightsStore.getState().setCategoryOptions(categoryOptions);
  router.push({
    pathname: '/dashboard/average-spending-category',
    params: { motorcycleId },
  });
}
