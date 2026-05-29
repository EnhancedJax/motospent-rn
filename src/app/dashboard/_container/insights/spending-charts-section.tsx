import React, { useState } from "react";
import { LayoutChangeEvent, ScrollView, StyleSheet, View } from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";

import { ExpenseItemIcon } from "@/components/expense-item-icon";
import { ThemedText } from "@/components/themed-text";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Spacing } from "@/constants/theme";
import type {
  SpendingChartRange,
  SpendingChartsResult,
} from "@/core/dashboard/types";
import { formatCurrency } from "@/core/expense/format-currency";
import { useTheme } from "@/hooks/use-theme";
import { getChartAxisStyle } from "@/theme/chart-colors";

import { SectionTitle } from "../../../../components/section-title";
import { computeBarSpacing, computeChartWidth } from "./chart-theme";
import { InsightCard } from "./insight-card";
import { SegmentedControl } from "@/components/ui/segmented-control";

type SpendingChartsSectionProps = {
  result: SpendingChartsResult;
  range: SpendingChartRange;
  onRangeChange: (range: SpendingChartRange) => void;
};

const RANGE_OPTIONS = [
  { value: "7d" as const, label: "7 days" },
  { value: "30d" as const, label: "30 days" },
  { value: "month" as const, label: "Month" },
  { value: "year" as const, label: "Year" },
];

export function SpendingChartsSection({
  result,
  range,
  onRangeChange,
}: SpendingChartsSectionProps) {
  const theme = useTheme();
  const [chartWidth, setChartWidth] = useState(300);
  const axisStyle = getChartAxisStyle(theme);

  const onLayout = (event: LayoutChangeEvent) => {
    setChartWidth(computeChartWidth(event.nativeEvent.layout.width));
  };

  const chartPalette = [
    theme.chart1,
    theme.chart2,
    theme.chart3,
    theme.chart4,
    theme.chart5,
  ];
  const barData = result.barData.map((point, index) => ({
    value: point.value,
    label: point.label,
    frontColor: chartPalette[index % chartPalette.length],
  }));

  const pieData = result.pieData.map((slice) => ({
    value: slice.value,
    color: slice.color,
    text: slice.showLabel ? slice.label : "",
    textColor: theme.foreground,
    textBackgroundColor: theme.card,
  }));

  const hasData =
    result.barData.some((b) => b.value > 0) || result.pieData.length > 0;

  return (
    <View style={styles.section} onLayout={onLayout}>
      <SectionTitle title="Spending" />
      <InsightCard style={styles.card} contentStyle={styles.content}>
        <View style={styles.header}>
          <CardDescription>Total</CardDescription>
          <CardTitle style={styles.total}>
            {formatCurrency(result.periodTotal)}
          </CardTitle>
        </View>
        <SegmentedControl
          options={RANGE_OPTIONS}
          value={range}
          onChange={onRangeChange}
        />
        {!hasData ? (
          <ThemedText
            type="default"
            themeColor="textSecondary"
            style={styles.emptyMessage}
          >
            No spending data for this range. Add expenses to see charts.
          </ThemedText>
        ) : (
          <>
            {barData.length > 0 ? (
              <View style={styles.chartBlock}>
                <ThemedText type="smallBold">By period</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    data={barData}
                    width={Math.max(chartWidth, barData.length * 36)}
                    height={180}
                    barWidth={22}
                    spacing={computeBarSpacing(barData.length, chartWidth)}
                    initialSpacing={8}
                    noOfSections={4}
                    yAxisTextStyle={axisStyle}
                    xAxisLabelTextStyle={axisStyle}
                    yAxisColor={theme.border}
                    xAxisColor={theme.border}
                    rulesColor={theme.border}
                    formatYLabel={(v) => `$${Math.round(Number(v))}`}
                  />
                </ScrollView>
              </View>
            ) : null}
            {pieData.length > 0 ? (
              <View style={styles.chartBlock}>
                <ThemedText type="smallBold">By category</ThemedText>
                <View style={styles.pieRow}>
                  <PieChart
                    data={pieData}
                    donut
                    radius={70}
                    innerRadius={45}
                    innerCircleColor={theme.card}
                    showText={false}
                    showValuesAsLabels={false}
                  />
                  <View style={styles.legend}>
                    {result.pieData.map((slice) => (
                      <View key={slice.label} style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: slice.color },
                          ]}
                        />
                        <ExpenseItemIcon iconKey={slice.iconKey} size={14} />
                        <ThemedText
                          type="small"
                          numberOfLines={1}
                          style={styles.legendLabel}
                        >
                          {slice.label}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {formatCurrency(slice.value)}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : null}
          </>
        )}
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
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  total: {
    fontSize: 24,
    lineHeight: 30,
  },
  emptyMessage: {
    lineHeight: 22,
  },
  chartBlock: {
    gap: Spacing.two,
  },
  pieRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  legend: {
    flex: 1,
    gap: Spacing.one,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    flex: 1,
  },
});
