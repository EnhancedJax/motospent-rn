import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useDashboardAnalytics } from '@/hooks/use-dashboard-analytics';
import { useTheme } from '@/hooks/use-theme';

import { AverageSpendingSection } from './average-spending-section';
import { FuelEfficiencySection } from './fuel-efficiency-section';
import { MaintenanceRecencySection } from './maintenance-recency-section';
import { OdometerChartSection } from './odometer-chart-section';
import { SpendingChartsSection } from './spending-charts-section';

type DashboardInsightsProps = {
  motorcycleId: string;
};

export function DashboardInsights({ motorcycleId }: DashboardInsightsProps) {
  const theme = useTheme();
  const analytics = useDashboardAnalytics(motorcycleId);

  if (analytics.isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MaintenanceRecencySection
        result={analytics.maintenanceRecency}
        motorcycleId={motorcycleId}
        distanceUnit={analytics.distUnit}
      />
      <FuelEfficiencySection
        result={analytics.fuelEfficiency}
        distanceUnit={analytics.distUnit}
        volumeUnit={analytics.volUnit}
      />
      <AverageSpendingSection
        motorcycleId={motorcycleId}
        result={analytics.averageSpending}
        period={analytics.averageSpendingPeriod}
        onPeriodChange={analytics.setAverageSpendingPeriod}
        categoryKey={analytics.averageSpendingCategory}
        categoryOptions={analytics.categoryOptions}
      />
      <SpendingChartsSection
        result={analytics.spendingCharts}
        range={analytics.spendingChartRange}
        onRangeChange={analytics.setSpendingChartRange}
      />
      <OdometerChartSection
        result={analytics.odometerTimeline}
        distanceUnit={analytics.distUnit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    minHeight: 120,
  },
});
