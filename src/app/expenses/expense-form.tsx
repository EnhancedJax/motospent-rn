import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { ExpenseForm } from '@/app/expenses/_container/expense-form';
import { expensesService } from '@/app-backend';
import type { ExpenseDTO } from '@/core/database/types';
import { useStandardExpenseItems } from '@/hooks/use-standard-expense-items';
import { useTheme } from '@/hooks/use-theme';
import { useMotorcycleUiStore } from '@/stores/motorcycle-ui-store';

export default function ExpenseFormScreen() {
  const theme = useTheme();
  const { mode, motorcycleId, expenseId } = useLocalSearchParams<{
    mode?: string;
    motorcycleId?: string;
    expenseId?: string;
  }>();
  const { items: catalogItems, isLoading: isLoadingCatalog } = useStandardExpenseItems();
  const selectedMotorcycleId = useMotorcycleUiStore((state) => state.selectedMotorcycleId);

  const formMode = mode === 'edit' ? 'edit' : 'create';
  const [expense, setExpense] = React.useState<ExpenseDTO | null>(null);
  const [isLoadingExpense, setIsLoadingExpense] = React.useState(formMode === 'edit');

  useEffect(() => {
    if (formMode !== 'edit' || !expenseId) {
      setExpense(null);
      setIsLoadingExpense(false);
      return;
    }

    let cancelled = false;
    setIsLoadingExpense(true);

    void expensesService.getById(expenseId).then((found) => {
      if (!cancelled) {
        setExpense(found);
        setIsLoadingExpense(false);
        if (!found) {
          router.back();
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [formMode, expenseId]);

  const resolvedMotorcycleId =
    formMode === 'edit' && expense
      ? expense.motorcycleId
      : (motorcycleId ?? selectedMotorcycleId ?? null);

  const isLoading = isLoadingCatalog || isLoadingExpense;

  useEffect(() => {
    if (!isLoading && formMode === 'create' && !resolvedMotorcycleId) {
      router.back();
    }
  }, [isLoading, formMode, resolvedMotorcycleId]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen
          options={{
            title: formMode === 'create' ? 'Add expense' : 'Edit expense',
            headerShown: true,
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: formMode === 'create' ? 'Add expense' : 'Edit expense',
          headerShown: true,
          contentStyle: { flex: 1, backgroundColor: theme.background },
        }}
      />
      {resolvedMotorcycleId ? (
        <ExpenseForm
          mode={formMode}
          expense={expense}
          catalogItems={catalogItems}
          motorcycleId={resolvedMotorcycleId}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
