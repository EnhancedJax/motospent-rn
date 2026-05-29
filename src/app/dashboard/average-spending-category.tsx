import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AverageSpendingCategorySheet } from '@/app/dashboard/_container/average-spending-category-sheet';
import { useTheme } from '@/hooks/use-theme';
import { normalizeRouteParam } from '@/navigation/route-params';
import { useMotorcycleUiStore } from '@/stores/motorcycle-ui-store';

export default function AverageSpendingCategoryScreen() {
  const theme = useTheme();
  const { motorcycleId: motorcycleIdParam } = useLocalSearchParams<{
    motorcycleId?: string | string[];
  }>();
  const selectedMotorcycleId = useMotorcycleUiStore((state) => state.selectedMotorcycleId);
  const motorcycleId =
    normalizeRouteParam(motorcycleIdParam) ?? selectedMotorcycleId ?? undefined;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Category', headerShown: true }} />
      <AverageSpendingCategorySheet motorcycleId={motorcycleId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
