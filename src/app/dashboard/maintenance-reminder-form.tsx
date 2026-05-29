import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { MaintenanceReminderForm } from '@/app/dashboard/_container/maintenance-reminder-form';
import { maintenanceRemindersService } from '@/app-backend';
import { ThemedText } from '@/components/themed-text';
import { useMaintenanceReminders } from '@/hooks/use-maintenance-reminders';
import { useStandardExpenseItems } from '@/hooks/use-standard-expense-items';
import { useTheme } from '@/hooks/use-theme';

export default function MaintenanceReminderFormScreen() {
  const theme = useTheme();
  const { motorcycleId, standardItemId } = useLocalSearchParams<{
    motorcycleId?: string;
    standardItemId?: string;
  }>();
  const { items: catalogItems, isLoading: isLoadingCatalog } = useStandardExpenseItems();
  const { reminders, isLoading: isLoadingReminders } = useMaintenanceReminders(
    motorcycleId ?? null,
  );

  const standardItem = useMemo(
    () => catalogItems.find((item) => item.id === standardItemId) ?? null,
    [catalogItems, standardItemId],
  );

  const existingReminder = useMemo(
    () => reminders.find((r) => r.standardItemId === standardItemId) ?? null,
    [reminders, standardItemId],
  );

  useEffect(() => {
    if (!motorcycleId || !standardItemId) {
      router.back();
    }
  }, [motorcycleId, standardItemId]);

  useEffect(() => {
    if (!isLoadingCatalog && standardItemId && !standardItem) {
      router.back();
    }
  }, [isLoadingCatalog, standardItem, standardItemId]);

  const isLoading = isLoadingCatalog || isLoadingReminders;

  if (!motorcycleId || !standardItemId || !standardItem) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: `Reminder: ${standardItem.name}`,
          headerShown: true,
          contentStyle: { flex: 1, backgroundColor: theme.background },
        }}
      />
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <MaintenanceReminderForm
          motorcycleId={motorcycleId}
          standardItem={standardItem}
          existingReminderId={existingReminder?.id ?? null}
          existingIntervalKm={existingReminder?.intervalDistanceKm ?? null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
