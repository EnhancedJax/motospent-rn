import { Trash } from 'phosphor-react-native';
import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ExpenseItemIcon } from '@/components/expense-item-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { computeOdometerDeltaForExpense } from '@/core/expense/compute-odometer-delta';
import { resolveExpenseDisplay } from '@/core/expense/expense-display';
import { formatCurrency } from '@/core/expense/format-currency';
import { formatAppDate } from '@/core/format/format-app-date';
import { formatFuelSubline } from '@/core/expense/format-fuel-subline';
import type { ExpenseDTO, StandardExpenseItemDTO } from '@/core/database/types';
import { formatDistance } from '@/core/units/format-distance';
import type { DistanceUnit, VolumeUnit } from '@/core/units/types';
import { useTheme } from '@/hooks/use-theme';
import { radius } from '@/theme/radius';

import { openExpenseForm } from './expense-utils';

type ExpenseRowProps = {
  expense: ExpenseDTO;
  allExpenses: ExpenseDTO[];
  catalogItems: StandardExpenseItemDTO[];
  distanceUnit: DistanceUnit;
  volumeUnit: VolumeUnit;
  onDelete: (id: string) => Promise<void>;
};

export function ExpenseRow({
  expense,
  allExpenses,
  catalogItems,
  distanceUnit,
  volumeUnit,
  onDelete,
}: ExpenseRowProps) {
  const theme = useTheme();
  const catalogById = new Map(catalogItems.map((item) => [item.id, item]));
  const display = resolveExpenseDisplay(expense, catalogById);
  const odometerDelta = computeOdometerDeltaForExpense(expense, allExpenses, distanceUnit);
  const fuelSubline =
    display.isFuel && expense.fuelAmountLiters !== undefined
      ? formatFuelSubline(expense.cost, expense.fuelAmountLiters, volumeUnit)
      : null;

  const handlePress = () => {
    openExpenseForm({
      mode: 'edit',
      expenseId: expense.id,
      motorcycleId: expense.motorcycleId,
    });
  };

  const handleDelete = () => {
    Alert.alert('Delete expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void onDelete(expense.id);
        },
      },
    ]);
  };

  const deltaColor =
    odometerDelta?.direction === 'up'
      ? '#16a34a'
      : odometerDelta?.direction === 'down'
        ? theme.destructive
        : theme.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={styles.mainRow}>
        <View style={styles.itemCell}>
          <ExpenseItemIcon iconKey={display.iconKey} />
          <ThemedText type="smallBold" numberOfLines={1} style={styles.itemLabel}>
            {display.label}
          </ThemedText>
        </View>

        <View style={styles.metaCell}>
          <ThemedText type="small" themeColor="textSecondary">
            {formatAppDate(expense.date)}
          </ThemedText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete expense"
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            handleDelete();
          }}
          style={styles.deleteButton}>
          <Trash size={18} color={theme.destructive} />
        </Pressable>
      </View>

      <View style={styles.detailRow}>
        <View style={styles.detailCell}>
          <ThemedText type="small">{formatDistance(expense.odometerKm, distanceUnit)}</ThemedText>
          {odometerDelta ? (
            <ThemedText type="small" style={{ color: deltaColor }}>
              {odometerDelta.delta > 0 ? '+' : ''}
              {new Intl.NumberFormat(undefined, {
                maximumFractionDigits: distanceUnit === 'mi' ? 1 : 0,
              }).format(odometerDelta.delta)}{' '}
              {distanceUnit}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.detailCell}>
          <ThemedText type="small">{formatCurrency(expense.cost)}</ThemedText>
          {fuelSubline ? (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {fuelSubline}
            </ThemedText>
          ) : null}
        </View>

        <View style={[styles.detailCell, styles.notesCell]}>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {expense.notes?.trim() ? expense.notes : '—'}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  itemCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minWidth: 0,
  },
  itemLabel: {
    flex: 1,
  },
  metaCell: {
    flexShrink: 0,
  },
  deleteButton: {
    padding: Spacing.one,
  },
  detailRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  detailCell: {
    flex: 1,
    gap: 2,
  },
  notesCell: {
    flex: 1.2,
  },
});
