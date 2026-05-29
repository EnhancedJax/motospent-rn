import { useFocusEffect } from '@react-navigation/native';
import { Plus } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  resolveSelectedMotorcycleId,
  sortMotorcyclesForCarousel,
} from '@/app/dashboard/_container/motorcycle-utils';
import { ScreenLayout } from '@/components/screen-layout';
import { Spacing } from '@/constants/theme';
import { expensesService } from '@/app-backend';
import { useExpenses } from '@/hooks/use-expenses';
import { useMotorcycles } from '@/hooks/use-motorcycles';
import { useSettings } from '@/hooks/use-settings';
import { useStandardExpenseItems } from '@/hooks/use-standard-expense-items';
import { useTheme } from '@/hooks/use-theme';
import { useMotorcycleUiStore } from '@/stores/motorcycle-ui-store';
import { ExpenseHistoryList } from './expense-history-list';
import { openExpenseForm } from './expense-utils';
import { MotorcycleSelect } from './motorcycle-select';

export function ExpensesScreen() {
  const theme = useTheme();
  const { motorcycles, isLoading: isLoadingMotorcycles } = useMotorcycles();
  const { items: catalogItems } = useStandardExpenseItems();
  const { distanceUnit, volumeUnit } = useSettings();
  const distUnit = distanceUnit ?? 'km';
  const volUnit = volumeUnit ?? 'L';

  const selectedMotorcycleId = useMotorcycleUiStore((state) => state.selectedMotorcycleId);
  const setSelectedMotorcycleId = useMotorcycleUiStore((state) => state.setSelectedMotorcycleId);
  const consumePendingSelectedId = useMotorcycleUiStore((state) => state.consumePendingSelectedId);

  const sortedMotorcycles = useMemo(
    () => sortMotorcyclesForCarousel(motorcycles),
    [motorcycles],
  );

  useEffect(() => {
    const resolved = resolveSelectedMotorcycleId(sortedMotorcycles, selectedMotorcycleId);
    if (resolved && resolved !== selectedMotorcycleId) {
      setSelectedMotorcycleId(resolved);
    }
  }, [sortedMotorcycles, selectedMotorcycleId, setSelectedMotorcycleId]);

  useFocusEffect(
    useCallback(() => {
      const pendingId = consumePendingSelectedId();
      if (pendingId) {
        setSelectedMotorcycleId(pendingId);
      }
    }, [consumePendingSelectedId, setSelectedMotorcycleId]),
  );

  const effectiveMotorcycleId =
    selectedMotorcycleId && sortedMotorcycles.some((m) => m.id === selectedMotorcycleId)
      ? selectedMotorcycleId
      : null;

  const { expenses, isLoading: isLoadingExpenses } = useExpenses(effectiveMotorcycleId);

  const handleAddExpense = () => {
    if (effectiveMotorcycleId) {
      openExpenseForm({ mode: 'create', motorcycleId: effectiveMotorcycleId });
    }
  };

  const handleDelete = async (id: string) => {
    await expensesService.delete(id);
  };

  const addExpenseButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add expense"
      disabled={!effectiveMotorcycleId}
      onPress={handleAddExpense}
      style={[
        styles.addButton,
        {
          backgroundColor: theme.primary,
          opacity: effectiveMotorcycleId ? 1 : 0.5,
        },
      ]}>
      <Plus size={22} color={theme.primaryForeground} weight="bold" />
    </Pressable>
  );

  return (
    <ScreenLayout title="Expenses" headerRight={addExpenseButton}>
      <View style={styles.content}>
        <MotorcycleSelect
          motorcycles={sortedMotorcycles}
          selectedId={effectiveMotorcycleId}
          onSelect={setSelectedMotorcycleId}
          disabled={isLoadingMotorcycles}
        />

        <ExpenseHistoryList
          expenses={expenses}
          catalogItems={catalogItems}
          distanceUnit={distUnit}
          volumeUnit={volUnit}
          isLoading={isLoadingMotorcycles || isLoadingExpenses}
          hasMotorcycle={sortedMotorcycles.length > 0}
          onDelete={handleDelete}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
});
