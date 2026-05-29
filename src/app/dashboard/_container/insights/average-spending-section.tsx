import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Spacing } from "@/constants/theme";
import type {
  AverageSpendingPeriod,
  AverageSpendingResult,
} from "@/core/dashboard/types";
import { formatCurrency } from "@/core/expense/format-currency";
import { useTheme } from "@/hooks/use-theme";

import { SectionTitle } from "../../../../components/section-title";
import { InsightCard } from "./insight-card";
import { SegmentedControl } from "./segmented-control";

type AverageSpendingSectionProps = {
  result: AverageSpendingResult;
  period: AverageSpendingPeriod;
  onPeriodChange: (period: AverageSpendingPeriod) => void;
  categoryKey: string;
  onCategoryChange: (key: string) => void;
  categoryOptions: { key: string; label: string }[];
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

  const periodLabel = period === "week" ? "week" : "month";
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
        <View
          style={[
            styles.pickerWrap,
            { backgroundColor: theme.muted, borderColor: theme.border },
          ]}
        >
          <Picker
            selectedValue={categoryKey}
            onValueChange={(value) => onCategoryChange(String(value))}
            dropdownIconColor={theme.foreground}
            style={[styles.picker, { color: theme.foreground }]}
          >
            {categoryOptions.map((option) => (
              <Picker.Item
                key={option.key}
                label={option.label}
                value={option.key}
              />
            ))}
          </Picker>
        </View>
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
  pickerWrap: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    ...(Platform.OS === "ios" ? { height: 120 } : {}),
  },
  picker: {
    ...(Platform.OS === "android" ? { height: 48 } : {}),
  },
  value: {
    fontSize: 28,
    lineHeight: 34,
  },
});
