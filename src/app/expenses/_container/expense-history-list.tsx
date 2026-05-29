import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { ExpenseDTO, StandardExpenseItemDTO } from '@/core/database/types';
import type { DistanceUnit, VolumeUnit } from '@/core/units/types';
import { useTheme } from '@/hooks/use-theme';

import { ExpenseRow } from './expense-row';

type ExpenseHistoryListProps = {
  expenses: ExpenseDTO[];
  catalogItems: StandardExpenseItemDTO[];
  distanceUnit: DistanceUnit;
  volumeUnit: VolumeUnit;
  isLoading: boolean;
  hasMotorcycle: boolean;
  onDelete: (id: string) => Promise<void>;
};

export function ExpenseHistoryList({
  expenses,
  catalogItems,
  distanceUnit,
  volumeUnit,
  isLoading,
  hasMotorcycle,
  onDelete,
}: ExpenseHistoryListProps) {
  const theme = useTheme();

  if (!hasMotorcycle) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (expenses.length === 0) {
    return (
      <View style={styles.centered}>
        <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
          No expenses yet. Add your first expense above.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {expenses.map((item) => (
        <ExpenseRow
          key={`${item.id}:${item.updatedAt}`}
          expense={item}
          allExpenses={expenses}
          catalogItems={catalogItems}
          distanceUnit={distanceUnit}
          volumeUnit={volumeUnit}
          onDelete={onDelete}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  centered: {
    paddingVertical: Spacing.five,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
});
