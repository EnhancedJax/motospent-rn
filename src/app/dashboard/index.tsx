import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useMotorcycleOdometer } from '@/hooks/use-motorcycle-odometer';
import { useMotorcycles } from '@/hooks/use-motorcycles';
import { useTheme } from '@/hooks/use-theme';
import { useMotorcycleUiStore } from '@/stores/motorcycle-ui-store';

import { DashboardMotorcycleBody } from './container/dashboard-motorcycle-body';
import { MotorcycleActionsButton } from './container/motorcycle-actions-button';
import { MotorcycleCarousel } from './container/motorcycle-carousel';
import { MotorcycleHeroOverlay } from './container/motorcycle-hero-overlay';
import {
  openMotorcycleForm,
  resolveSelectedMotorcycleId,
  sortMotorcyclesForCarousel,
} from './container/motorcycle-utils';

export default function DashboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { motorcycles, isLoading: isLoadingList } = useMotorcycles();

  const sortedMotorcycles = useMemo(
    () => sortMotorcyclesForCarousel(motorcycles),
    [motorcycles],
  );

  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState<string | null>(null);
  const consumePendingSelectedId = useMotorcycleUiStore((state) => state.consumePendingSelectedId);

  useEffect(() => {
    setSelectedMotorcycleId((current) => resolveSelectedMotorcycleId(sortedMotorcycles, current));
  }, [sortedMotorcycles]);

  useFocusEffect(
    useCallback(() => {
      const pendingId = consumePendingSelectedId();
      if (pendingId) {
        setSelectedMotorcycleId(pendingId);
      }
    }, [consumePendingSelectedId]),
  );

  const selectedMotorcycle =
    sortedMotorcycles.find((m) => m.id === selectedMotorcycleId) ?? null;

  const { reading, isLoading: isLoadingOdometer } = useMotorcycleOdometer(selectedMotorcycleId);

  const openCreateForm = () => {
    openMotorcycleForm({ mode: 'create' });
  };

  const openEditForm = () => {
    if (selectedMotorcycleId) {
      openMotorcycleForm({ mode: 'edit', motorcycleId: selectedMotorcycleId });
    }
  };

  const horizontalPadding = Math.max(insets.left, Spacing.four);

  return (
    <ThemedView
      style={[
        styles.screen,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + BottomTabInset,
        },
      ]}>
      <View style={styles.heroSection}>
        <MotorcycleCarousel
          motorcycles={sortedMotorcycles}
          selectedId={selectedMotorcycleId}
          onSelect={setSelectedMotorcycleId}
        />
        <MotorcycleHeroOverlay motorcycle={selectedMotorcycle} reading={reading} />
        <MotorcycleActionsButton
          selectedMotorcycle={selectedMotorcycle}
          onAdd={openCreateForm}
          onEdit={openEditForm}
        />
      </View>

      <View
        style={[
          styles.body,
          {
            paddingLeft: horizontalPadding,
            paddingRight: Math.max(insets.right, Spacing.four),
          },
        ]}>
        <DashboardMotorcycleBody
          motorcycle={selectedMotorcycle}
          isLoading={isLoadingList || isLoadingOdometer}
          hasMotorcycles={sortedMotorcycles.length > 0}
          onAdd={openCreateForm}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  heroSection: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  },
  body: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
