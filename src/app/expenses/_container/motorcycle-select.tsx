import { CaretLeft, CaretRight } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { MotorcycleDTO } from '@/core/database/types';
import { useTheme } from '@/hooks/use-theme';
import { radius } from '@/theme/radius';

type MotorcycleSelectProps = {
  motorcycles: MotorcycleDTO[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
};

export function MotorcycleSelect({
  motorcycles,
  selectedId,
  onSelect,
  disabled = false,
}: MotorcycleSelectProps) {
  const theme = useTheme();

  const selectedIndex = useMemo(() => {
    if (!selectedId || motorcycles.length === 0) {
      return 0;
    }
    const index = motorcycles.findIndex((m) => m.id === selectedId);
    return index >= 0 ? index : 0;
  }, [motorcycles, selectedId]);

  const selectedMotorcycle = motorcycles[selectedIndex] ?? null;
  const canNavigate = motorcycles.length > 1 && !disabled;

  const goToIndex = (index: number) => {
    const motorcycle = motorcycles[index];
    if (motorcycle) {
      onSelect(motorcycle.id);
    }
  };

  const goPrevious = () => {
    if (!canNavigate) {
      return;
    }
    const nextIndex = selectedIndex <= 0 ? motorcycles.length - 1 : selectedIndex - 1;
    goToIndex(nextIndex);
  };

  const goNext = () => {
    if (!canNavigate) {
      return;
    }
    const nextIndex = selectedIndex >= motorcycles.length - 1 ? 0 : selectedIndex + 1;
    goToIndex(nextIndex);
  };

  if (motorcycles.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.muted, borderColor: theme.border }]}>
        <ThemedText type="small" themeColor="textSecondary">
          Add a motorcycle on the Dashboard first.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.muted, borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Previous motorcycle"
        disabled={!canNavigate}
        onPress={goPrevious}
        hitSlop={8}
        style={[styles.arrowButton, { opacity: canNavigate ? 1 : 0.35 }]}>
        <CaretLeft size={22} color={theme.text} weight="bold" />
      </Pressable>

      <View style={styles.labelContainer}>
        <ThemedText type="default" numberOfLines={1} style={styles.nameLabel}>
          {selectedMotorcycle?.name ?? '—'}
        </ThemedText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next motorcycle"
        disabled={!canNavigate}
        onPress={goNext}
        hitSlop={8}
        style={[styles.arrowButton, { opacity: canNavigate ? 1 : 0.35 }]}>
        <CaretRight size={22} color={theme.text} weight="bold" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  arrowButton: {
    padding: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  nameLabel: {
    textAlign: 'center',
  },
});
