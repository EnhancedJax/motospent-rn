import React from "react";
import { StyleSheet, View } from "react-native";

import { Spacing } from "@/constants/theme";
import type { FuelEfficiencyResult } from "@/core/dashboard/types";
import { formatCurrency } from "@/core/expense/format-currency";
import type { DistanceUnit, VolumeUnit } from "@/core/units/types";

import { SectionTitle } from "../../../../components/section-title";
import { InsightEmptyCard } from "./insight-empty-card";
import { InsightMetricCard } from "./insight-metric-card";

type FuelEfficiencySectionProps = {
  result: FuelEfficiencyResult;
  distanceUnit: DistanceUnit;
  volumeUnit: VolumeUnit;
};

function formatNumber(value: number, decimals = 1): string {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

function formatSpread(
  min: number,
  max: number,
  formatter: (v: number) => string,
): string {
  return `${formatter(min)} ↓  ${formatter(max)} ↑`;
}

export function FuelEfficiencySection({
  result,
  distanceUnit,
  volumeUnit,
}: FuelEfficiencySectionProps) {
  const distLabel = distanceUnit === "mi" ? "mi" : "km";
  const volLabel = volumeUnit === "gal" ? "gal" : "L";
  const perVolUnit = `${distLabel}/${volLabel}`;

  if (result.kind === "empty") {
    return (
      <View style={styles.section}>
        <SectionTitle title="Fuel efficiency" />
        <InsightEmptyCard message="Add at least two fuel entries with volume and odometer readings to see lifetime fuel stats." />
      </View>
    );
  }

  const { distancePerVolume, costPerDistance, intervalCount } = result;

  return (
    <View style={styles.section}>
      <SectionTitle
        title="Fuel efficiency"
        subtitle={`Lifetime stats across ${intervalCount} fuel interval${intervalCount === 1 ? "" : "s"}.`}
      />
      <View style={styles.row}>
        <InsightMetricCard
          title="Distance per fuel unit"
          value={`${formatNumber(distancePerVolume.avg)} ${perVolUnit}`}
          spread={formatSpread(
            distancePerVolume.min,
            distancePerVolume.max,
            (v) => `${formatNumber(v)} ${perVolUnit}`,
          )}
        />
        <InsightMetricCard
          title="Cost per distance unit"
          value={`${formatCurrency(costPerDistance.avg)}/${distLabel}`}
          spread={formatSpread(
            costPerDistance.min,
            costPerDistance.max,
            (v) => `${formatCurrency(v)}/${distLabel}`,
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
});
