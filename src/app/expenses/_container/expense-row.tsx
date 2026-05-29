import { Trash } from "phosphor-react-native";
import React, { useCallback, useRef } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

import { ExpenseItemIcon } from "@/components/expense-item-icon";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import type { ExpenseDTO, StandardExpenseItemDTO } from "@/core/database/types";
import { computeOdometerDeltaForExpense } from "@/core/expense/compute-odometer-delta";
import { resolveExpenseDisplay } from "@/core/expense/expense-display";
import { formatCurrency } from "@/core/expense/format-currency";
import { formatFuelSubline } from "@/core/expense/format-fuel-subline";
import { formatAppDate } from "@/core/format/format-app-date";
import { formatDistance } from "@/core/units/format-distance";
import type { DistanceUnit, VolumeUnit } from "@/core/units/types";
import { useTheme } from "@/hooks/use-theme";
import { radius } from "@/theme/radius";

import { openExpenseForm } from "./expense-utils";

const DELETE_ACTION_WIDTH = 72;
const PRESS_BLOCK_MS = 300;

type ExpenseRowProps = {
  expense: ExpenseDTO;
  allExpenses: ExpenseDTO[];
  catalogItems: StandardExpenseItemDTO[];
  distanceUnit: DistanceUnit;
  volumeUnit: VolumeUnit;
  onDelete: (id: string) => Promise<void>;
};

type DeleteSwipeActionProps = {
  onPress: () => void;
  backgroundColor: string;
};

function DeleteSwipeAction({ onPress, backgroundColor }: DeleteSwipeActionProps) {
  return (
    <View style={styles.deleteActionOuter}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Delete expense"
        onPress={onPress}
        style={[styles.deleteAction, { backgroundColor }]}
      >
        <Trash size={20} color="#fff" weight="bold" />
      </Pressable>
    </View>
  );
}

export function ExpenseRow({
  expense,
  allExpenses,
  catalogItems,
  distanceUnit,
  volumeUnit,
  onDelete,
}: ExpenseRowProps) {
  const theme = useTheme();
  const swipeableRef = useRef<SwipeableMethods>(null);
  const blockRowPressRef = useRef(false);
  const catalogById = new Map(catalogItems.map((item) => [item.id, item]));
  const display = resolveExpenseDisplay(expense, catalogById);
  const odometerDelta = computeOdometerDeltaForExpense(
    expense,
    allExpenses,
    distanceUnit,
  );
  const fuelSubline =
    display.isFuel && expense.fuelAmountLiters !== undefined
      ? formatFuelSubline(expense.cost, expense.fuelAmountLiters, volumeUnit)
      : null;

  const scheduleRowPressUnblock = useCallback(() => {
    setTimeout(() => {
      blockRowPressRef.current = false;
    }, PRESS_BLOCK_MS);
  }, []);

  const handlePress = () => {
    if (blockRowPressRef.current) {
      return;
    }
    openExpenseForm({
      mode: "edit",
      expenseId: expense.id,
      motorcycleId: expense.motorcycleId,
    });
  };

  const handleDelete = () => {
    swipeableRef.current?.close();
    Alert.alert(
      "Delete expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void onDelete(expense.id);
          },
        },
      ],
    );
  };

  const renderRightActions = useCallback(
    () => (
      <DeleteSwipeAction
        onPress={handleDelete}
        backgroundColor={theme.destructive}
      />
    ),
    [handleDelete, theme.destructive],
  );

  const deltaColor =
    odometerDelta?.direction === "up"
      ? "#16a34a"
      : odometerDelta?.direction === "down"
        ? theme.destructive
        : theme.textSecondary;

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      containerStyle={[
        styles.swipeableContainer,
        { borderColor: theme.border },
      ]}
      friction={2}
      overshootRight={false}
      rightThreshold={DELETE_ACTION_WIDTH / 2}
      onSwipeableOpenStartDrag={() => {
        blockRowPressRef.current = true;
      }}
      onSwipeableClose={scheduleRowPressUnblock}
      renderRightActions={renderRightActions}
    >
      <Pressable
        accessibilityRole="button"
        onPress={handlePress}
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: theme.card,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <View style={styles.mainRow}>
          <View style={styles.itemCell}>
            <ExpenseItemIcon iconKey={display.iconKey} />
            <ThemedText
              type="smallBold"
              numberOfLines={1}
              style={styles.itemLabel}
            >
              {display.label}
            </ThemedText>
          </View>

          <View style={styles.metaCell}>
            <ThemedText type="small" themeColor="textSecondary">
              {formatAppDate(expense.date)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailCell}>
            <ThemedText type="small">
              {formatDistance(expense.odometerKm, distanceUnit)}
            </ThemedText>
            {odometerDelta ? (
              <ThemedText type="small" style={{ color: deltaColor }}>
                {odometerDelta.delta > 0 ? "+" : ""}
                {new Intl.NumberFormat(undefined, {
                  maximumFractionDigits: distanceUnit === "mi" ? 1 : 0,
                }).format(odometerDelta.delta)}{" "}
                {distanceUnit}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.detailCell}>
            <ThemedText type="small">{formatCurrency(expense.cost)}</ThemedText>
            {fuelSubline ? (
              <ThemedText
                type="small"
                themeColor="textSecondary"
                numberOfLines={1}
              >
                {fuelSubline}
              </ThemedText>
            ) : null}
          </View>
        </View>
      </Pressable>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  swipeableContainer: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  itemCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    minWidth: 0,
  },
  itemLabel: {
    flex: 1,
  },
  metaCell: {
    flexShrink: 0,
  },
  deleteActionOuter: {
    width: DELETE_ACTION_WIDTH,
    height: "100%",
  },
  deleteAction: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  detailRow: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  detailCell: {
    flex: 1,
    gap: 2,
  },
});
