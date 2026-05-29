import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { LatestOdometerReading } from '@/app-backend/odometer/odometer-engine';
import type { MotorcycleDTO } from '@/core/database/types';
import { formatAppDate } from '@/core/format/format-app-date';
import { formatDistance } from '@/core/units/format-distance';
import { useSettings } from '@/hooks/use-settings';

type MotorcycleHeroOverlayProps = {
  motorcycle: MotorcycleDTO | null;
  reading: LatestOdometerReading | null;
};

export function MotorcycleHeroOverlay({ motorcycle, reading }: MotorcycleHeroOverlayProps) {
  const insets = useSafeAreaInsets();
  const { distanceUnit } = useSettings();
  const unit = distanceUnit ?? 'km';
  const horizontalInset = Math.max(insets.left, Spacing.four);

  if (!motorcycle) {
    return null;
  }

  const odometerLabel = reading
    ? formatDistance(reading.odometerKm, unit)
    : formatDistance(motorcycle.odometerAtAdditionKm, unit);
  const recordedAt = reading?.recordedAt ?? motorcycle.createdAt;

  return (
    <View
      style={[styles.overlay, { left: horizontalInset, right: horizontalInset }]}
      pointerEvents="none">
      <ThemedText type="subtitle" style={styles.name}>
        {motorcycle.name}
      </ThemedText>
      <ThemedText type="small" style={styles.meta}>
        {odometerLabel} · since last recorded on {formatAppDate(recordedAt)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: Spacing.three,
    gap: Spacing.half,
  },
  name: {
    fontSize: 28,
    lineHeight: 34,
    color: '#ffffff',
  },
  meta: {
    color: 'rgba(255, 255, 255, 0.82)',
  },
});
