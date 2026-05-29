import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/hooks/use-settings';
import { useTheme } from '@/hooks/use-theme';

const UNITS = [
  { value: 'km' as const, label: 'km' },
  { value: 'mi' as const, label: 'mi' },
];

export function DistanceUnitPicker() {
  const theme = useTheme();
  const { distanceUnit, setDistanceUnit, isLoading } = useSettings();

  return (
    <View style={styles.row}>
      <ThemedText type="default" style={styles.title}>
        Distance unit
      </ThemedText>
      {isLoading ? (
        <ActivityIndicator color={theme.primary} />
      ) : (
        <View style={[styles.segmented, { backgroundColor: theme.muted }]}>
          {UNITS.map((unit) => {
            const isSelected = distanceUnit === unit.value;
            return (
              <Pressable
                key={unit.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => void setDistanceUnit(unit.value)}
                style={[
                  styles.segment,
                  isSelected && {
                    backgroundColor: theme.card,
                    shadowColor: theme.border,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  themeColor={isSelected ? 'text' : 'textSecondary'}>
                  {unit.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
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
  segmented: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: Spacing.half,
    gap: Spacing.half,
  },
  segment: {
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
});
