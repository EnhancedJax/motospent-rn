import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { MotorcycleDTO } from '@/core/database/types';
import { useTheme } from '@/hooks/use-theme';

import { DashboardInsights } from './insights/dashboard-insights';

type DashboardMotorcycleBodyProps = {
  motorcycle: MotorcycleDTO | null;
  isLoading: boolean;
  hasMotorcycles: boolean;
  onAdd: () => void;
};

export function DashboardMotorcycleBody({
  motorcycle,
  isLoading,
  hasMotorcycles,
  onAdd,
}: DashboardMotorcycleBodyProps) {
  const theme = useTheme();

  if (!hasMotorcycles) {
    return (
      <View style={styles.container}>
        <ThemedText type="default" themeColor="textSecondary" style={styles.message}>
          Track spending and maintenance for each bike you own. Add your first motorcycle to get
          started.
        </ThemedText>
        <ThemedText type="linkPrimary" onPress={onAdd}>
          Add motorcycle
        </ThemedText>
      </View>
    );
  }

  if (isLoading || !motorcycle) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return <DashboardInsights motorcycleId={motorcycle.id} />;
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    minHeight: 120,
  },
  message: {
    lineHeight: 24,
  },
});
