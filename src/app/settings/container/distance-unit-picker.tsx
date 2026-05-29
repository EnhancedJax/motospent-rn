import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import type { DistanceUnit } from '@/app-backend';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/hooks/use-settings';
import { useTheme } from '@/hooks/use-theme';

const UNITS: { value: DistanceUnit; label: string }[] = [
  { value: 'km', label: 'km' },
  { value: 'mi', label: 'mi' },
];

export function DistanceUnitPicker() {
  const theme = useTheme();
  const { distanceUnit, setDistanceUnit, isLoading } = useSettings();

  return (
    <View style={styles.row}>
      <ThemedText type="default" style={styles.title}>
        Distance unit
      </ThemedText>
      {isLoading || distanceUnit == null ? (
        <ActivityIndicator color={theme.primary} />
      ) : (
        <SegmentedControl
          compact
          options={UNITS}
          value={distanceUnit}
          onChange={(unit) => void setDistanceUnit(unit)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  title: {
    flexShrink: 1,
  },
});
