import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PageShell } from '@/components/page-shell';
import { Spacing } from '@/constants/theme';
import { useMotorcycleOdometer } from '@/hooks/use-motorcycle-odometer';
import { useMotorcycles } from '@/hooks/use-motorcycles';
import { useMotorcycleUiStore } from '@/stores/motorcycle-ui-store';

import { DashboardMotorcycleBody } from './_container/dashboard-motorcycle-body';
import { MotorcycleActionsButton } from './_container/motorcycle-actions-button';
import { MotorcycleCarousel } from './_container/motorcycle-carousel';
import { MotorcycleHeroOverlay } from './_container/motorcycle-hero-overlay';
import {
  openMotorcycleForm,
  resolveSelectedMotorcycleId,
  sortMotorcyclesForCarousel,
} from './_container/motorcycle-utils';

export default function DashboardScreen() {
  const { motorcycles, isLoading: isLoadingList } = useMotorcycles();

  const sortedMotorcycles = useMemo(
    () => sortMotorcyclesForCarousel(motorcycles),
    [motorcycles],
  );

  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState<string | null>(null);
  const consumePendingSelectedId = useMotorcycleUiStore((state) => state.consumePendingSelectedId);
  const setGlobalSelectedMotorcycleId = useMotorcycleUiStore(
    (state) => state.setSelectedMotorcycleId,
  );

  useEffect(() => {
    setSelectedMotorcycleId((current) => resolveSelectedMotorcycleId(sortedMotorcycles, current));
  }, [sortedMotorcycles]);

  useFocusEffect(
    useCallback(() => {
      const pendingId = consumePendingSelectedId();
      if (pendingId) {
        setSelectedMotorcycleId(pendingId);
        setGlobalSelectedMotorcycleId(pendingId);
      }
    }, [consumePendingSelectedId, setGlobalSelectedMotorcycleId]),
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

  return (
    <PageShell>
      <PageShell.FullBleed style={styles.heroSection}>
        <MotorcycleCarousel
          motorcycles={sortedMotorcycles}
          selectedId={selectedMotorcycleId}
          onSelect={(id) => {
            setSelectedMotorcycleId(id);
            setGlobalSelectedMotorcycleId(id);
          }}
        />
        <MotorcycleHeroOverlay motorcycle={selectedMotorcycle} reading={reading} />
        <MotorcycleActionsButton
          selectedMotorcycle={selectedMotorcycle}
          onAdd={openCreateForm}
          onEdit={openEditForm}
        />
      </PageShell.FullBleed>

      <PageShell.Content style={styles.body}>
        <DashboardMotorcycleBody
          motorcycle={selectedMotorcycle}
          isLoading={isLoadingList || isLoadingOdometer}
          hasMotorcycles={sortedMotorcycles.length > 0}
          onAdd={openCreateForm}
        />
      </PageShell.Content>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    position: 'relative',
  },
  body: {
    paddingTop: Spacing.three,
  },
});
