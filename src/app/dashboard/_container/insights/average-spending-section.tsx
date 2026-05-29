import { CaretDownIcon } from "phosphor-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { openAverageSpendingCategorySheet } from "@/app/dashboard/_container/average-spending-category-utils";
import { ExpenseItemIcon } from "@/components/expense-item-icon";
import { ThemedText } from "@/components/themed-text";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Spacing } from "@/constants/theme";
import type {
  AverageSpendingPeriod,
  AverageSpendingResult,
} from "@/core/dashboard/types";
import { formatCurrency } from "@/core/expense/format-currency";
import { useTheme } from "@/hooks/use-theme";
import type { AverageSpendingCategoryOption } from "@/stores/dashboard-insights-store";

import { SectionTitle } from "../../../../components/section-title";
import { InsightCard } from "./insight-card";
import { SegmentedControl } from "@/components/ui/segmented-control";

export type { AverageSpendingCategoryOption };

type AverageSpendingSectionProps = {
  motorcycleId: string;
  result: AverageSpendingResult;
  period: AverageSpendingPeriod;
  onPeriodChange: (period: AverageSpendingPeriod) => void;
  categoryKey: string;
  categoryOptions: AverageSpendingCategoryOption[];
};

export function AverageSpendingSection({
  motorcycleId,
  result,
  period,
  onPeriodChange,
  categoryKey,
  categoryOptions,
}: AverageSpendingSectionProps) {
  const theme = useTheme();

  const periodLabel = period === "week" ? "week" : "month";
  const selectedCategory =
    categoryOptions.find((option) => option.key === categoryKey) ??
    categoryOptions[0];
  const spread =
    result.min !== null && result.max !== null
      ? `${formatCurrency(result.min)} ↓  ${formatCurrency(result.max)} ↑`
      : undefined;

  return (
    <View style={styles.section}>
      <SectionTitle title="Average spending" />
      <InsightCard style={styles.card} contentStyle={styles.content}>
        <SegmentedControl
          options={[
            { value: "week" as const, label: "Per week" },
            { value: "month" as const, label: "Per month" },
          ]}
          value={period}
          onChange={onPeriodChange}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select spending category"
          onPress={() =>
            openAverageSpendingCategorySheet(motorcycleId, categoryOptions)
          }
          style={[styles.categoryButton, { backgroundColor: theme.muted }]}
        >
          {selectedCategory ? (
            <ExpenseItemIcon iconKey={selectedCategory.iconKey} size={20} />
          ) : null}
          <ThemedText type="default" style={styles.categoryButtonLabel}>
            {selectedCategory?.label ?? "Category"}
          </ThemedText>
          <CaretDownIcon size={16} color={theme.mutedForeground} />
        </Pressable>
        <CardDescription>Average spend per {periodLabel}</CardDescription>
        <CardTitle style={styles.value}>
          {result.periodCount > 0 ? formatCurrency(result.average) : "—"}
        </CardTitle>
        {spread ? (
          <ThemedText type="small" themeColor="textSecondary">
            {spread}
          </ThemedText>
        ) : null}
        <ThemedText type="small" themeColor="textSecondary">
          {result.periodCount > 0
            ? `Based on ${result.periodCount} ${result.periodLabel} with expenses.`
            : "No expenses in this category yet."}
        </ThemedText>
      </InsightCard>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  card: {
    flex: undefined,
    minWidth: undefined,
  },
  content: {
    gap: Spacing.two,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  categoryButtonLabel: {
    flex: 1,
    fontSize: 16,
  },
  value: {
    fontSize: 28,
    lineHeight: 34,
  },
});
