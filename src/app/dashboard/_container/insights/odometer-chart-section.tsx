import React, { useState } from "react";
import { LayoutChangeEvent, ScrollView, StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import type { OdometerTimelineResult } from "@/core/dashboard/types";
import { formatAppDate } from "@/core/format/format-app-date";
import type { DistanceUnit } from "@/core/units/types";
import { useTheme } from "@/hooks/use-theme";
import { getChartAxisStyle } from "@/theme/chart-colors";

import { SectionTitle } from "../../../../components/section-title";
import { computeChartWidth } from "./chart-theme";
import { InsightCard } from "./insight-card";
import { InsightEmptyCard } from "./insight-empty-card";

type OdometerChartSectionProps = {
  result: OdometerTimelineResult;
  distanceUnit: DistanceUnit;
};

export function OdometerChartSection({
  result,
  distanceUnit,
}: OdometerChartSectionProps) {
  const theme = useTheme();
  const [chartWidth, setChartWidth] = useState(300);
  const axisStyle = getChartAxisStyle(theme);
  const unitLabel = distanceUnit === "mi" ? "mi/day" : "km/day";

  const onLayout = (event: LayoutChangeEvent) => {
    setChartWidth(computeChartWidth(event.nativeEvent.layout.width));
  };

  if (result.kind === "empty") {
    return (
      <View style={styles.section}>
        <SectionTitle title="Odometer over time" />
        <InsightEmptyCard message="Log expenses with odometer readings to track mileage over time." />
      </View>
    );
  }

  if (result.kind === "single") {
    const unit = distanceUnit === "mi" ? "mi" : "km";
    return (
      <View style={styles.section}>
        <SectionTitle title="Odometer over time" />
        <InsightCard style={styles.card}>
          <ThemedText type="default">
            {result.reading.toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}{" "}
            {unit}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Recorded {formatAppDate(result.date)}
          </ThemedText>
        </InsightCard>
      </View>
    );
  }

  const lineData = result.points.map((point) => ({
    value: point.odometerDisplay,
    label: point.label,
    hideDataPoint: result.showDataPoints ? !point.hasReading : true,
  }));

  const secondaryData = result.trendPoints.map((value) => ({ value }));

  const spacing =
    result.points.length > 1
      ? Math.max(8, (chartWidth - 40) / (result.points.length - 1))
      : 40;

  return (
    <View style={styles.section} onLayout={onLayout}>
      <SectionTitle title="Odometer over time" />
      <InsightCard style={styles.card} contentStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary">
          Avg daily increase:{" "}
          <ThemedText type="smallBold">
            {result.avgDailyIncrease.toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}{" "}
            {unitLabel}
          </ThemedText>
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={lineData}
            secondaryData={secondaryData}
            width={Math.max(chartWidth, result.points.length * spacing)}
            height={180}
            spacing={spacing}
            initialSpacing={8}
            color={theme.chart4}
            thickness={2}
            dataPointsColor={theme.chart4}
            dataPointsRadius={4}
            secondaryLineConfig={{
              color: theme.mutedForeground,
              thickness: 1,
              curved: false,
              hideDataPoints: true,
            }}
            curved
            noOfSections={4}
            yAxisTextStyle={axisStyle}
            xAxisLabelTextStyle={axisStyle}
            yAxisColor={theme.border}
            xAxisColor={theme.border}
            rulesColor={theme.border}
            formatYLabel={(v) =>
              Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })
            }
          />
        </ScrollView>
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
});
