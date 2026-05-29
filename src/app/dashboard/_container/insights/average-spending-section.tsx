import { CaretDownIcon } from "phosphor-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AverageSpendingCategoryPicker } from "@/app/dashboard/_container/average-spending-category-sheet";
import { ExpenseItemIcon } from "@/components/expense-item-icon";
import { ThemedText } from "@/components/themed-text";
import { CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Spacing } from "@/constants/theme";
import type {
  AverageSpendingPeriod,
  AverageSpendingResult,
} from "@/core/dashboard/types";
import { formatCurrency } from "@/core/expense/format-currency";
import { useTheme } from "@/hooks/use-theme";
import type { AverageSpendingCategoryOption } from "@/stores/dashboard-insights-store";

import { SegmentedControl } from "@/components/ui/segmented-control";
import { SectionTitle } from "../../../../components/section-title";
import { InsightCard } from "./insight-card";

export type { AverageSpendingCategoryOption };

type AverageSpendingSectionProps = {
  result: AverageSpendingResult;
  period: AverageSpendingPeriod;
  onPeriodChange: (period: AverageSpendingPeriod) => void;
  categoryKey: string;
  onCategoryChange: (key: string) => void;
  categoryOptions: AverageSpendingCategoryOption[];
};

export function AverageSpendingSection({
  result,
  period,
  onPeriodChange,
  categoryKey,
  onCategoryChange,
  categoryOptions,
}: AverageSpendingSectionProps) {
  const theme = useTheme();
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);

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
          onPress={() => setCategorySheetOpen(true)}
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
        <View style={styles.valueContainer}>
          <CardTitle style={styles.value}>
            {result.periodCount > 0 ? formatCurrency(result.average) : "—"}
          </CardTitle>
          {spread ? (
            <ThemedText type="default" themeColor="textSecondary">
              {spread}
            </ThemedText>
          ) : null}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {result.periodCount > 0
            ? `Based on ${result.periodCount} ${result.periodLabel} with expenses.`
            : "No expenses in this category yet."}
        </ThemedText>
      </InsightCard>

      <Sheet
        visible={categorySheetOpen}
        onClose={() => setCategorySheetOpen(false)}
        title="Category"
      >
        <SheetContent>
          <AverageSpendingCategoryPicker
            options={categoryOptions}
            selectedKey={categoryKey}
            onSelect={(key) => {
              onCategoryChange(key);
              setCategorySheetOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>
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
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  value: {
    fontSize: 28,
    lineHeight: 34,
  },
});
