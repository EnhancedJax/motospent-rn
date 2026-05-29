import { router } from 'expo-router';

export function openExpenseForm(params: {
  mode: 'create' | 'edit';
  motorcycleId?: string;
  expenseId?: string;
}) {
  router.push({
    pathname: '/expenses/expense-form',
    params: {
      mode: params.mode,
      ...(params.motorcycleId ? { motorcycleId: params.motorcycleId } : {}),
      ...(params.expenseId ? { expenseId: params.expenseId } : {}),
    },
  });
}
