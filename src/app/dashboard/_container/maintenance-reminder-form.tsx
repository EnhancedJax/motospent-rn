import { router, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { DomainError, maintenanceRemindersService } from '@/app-backend';
import { KeyboardAwareFormScroll } from '@/components/keyboard-aware-form-scroll';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FormField, FormInput } from '@/components/ui/form';
import { Spacing } from '@/constants/theme';
import type { StandardExpenseItemDTO } from '@/core/database/types';
import { fromStorageKm } from '@/core/units/distance';
import { useSettings } from '@/hooks/use-settings';
import { useTheme } from '@/hooks/use-theme';
import { radius } from '@/theme/radius';

type MaintenanceReminderFormProps = {
  motorcycleId: string;
  standardItem: StandardExpenseItemDTO;
  existingReminderId: string | null;
  existingIntervalKm: number | null;
};

export function MaintenanceReminderForm({
  motorcycleId,
  standardItem,
  existingReminderId,
  existingIntervalKm,
}: MaintenanceReminderFormProps) {
  const navigation = useNavigation();
  const theme = useTheme();
  const { distanceUnit } = useSettings();
  const unit = distanceUnit ?? 'km';
  const unitLabel = unit === 'mi' ? 'mi' : 'km';

  const [intervalText, setIntervalText] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setSubmitError(null);
    setFieldError(null);
    const defaultKm =
      existingIntervalKm && existingIntervalKm > 0
        ? existingIntervalKm
        : standardItem.suggestDistanceKm > 0
          ? standardItem.suggestDistanceKm
          : 0;
    const display = fromStorageKm(defaultKm, unit);
    setIntervalText(defaultKm > 0 ? String(Math.round(display)) : '');
  }, [existingIntervalKm, standardItem.suggestDistanceKm, unit]);

  const submit = useCallback(async () => {
    const parsed = Number.parseFloat(intervalText);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setFieldError(`Enter a valid interval in ${unitLabel}.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setFieldError(null);

    try {
      await maintenanceRemindersService.upsert({
        motorcycleId,
        standardItemId: standardItem.id,
        intervalDistance: parsed,
      });
      router.back();
    } catch (error) {
      const message =
        error instanceof DomainError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Failed to save reminder';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [intervalText, motorcycleId, standardItem.id, unitLabel]);

  const handleDelete = useCallback(async () => {
    if (!existingReminderId) {
      router.back();
      return;
    }

    setIsDeleting(true);
    setSubmitError(null);

    try {
      await maintenanceRemindersService.delete(existingReminderId);
      router.back();
    } catch (error) {
      const message =
        error instanceof DomainError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Failed to delete reminder';
      setSubmitError(message);
    } finally {
      setIsDeleting(false);
    }
  }, [existingReminderId]);

  const isBusy = isSubmitting || isDeleting;

  useLayoutEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save reminder"
          disabled={isBusy}
          onPress={() => void submit()}
          hitSlop={8}
          style={[styles.headerSave, { opacity: isBusy ? 0.5 : 1 }]}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <ThemedText type="linkPrimary" style={styles.headerSaveLabel}>
              Save
            </ThemedText>
          )}
        </Pressable>
      ),
    });

    return () => {
      navigation.setOptions({ headerRight: undefined });
    };
  }, [navigation, submit, isSubmitting, isBusy, theme.primary]);

  const showFooterSubmit = Platform.OS !== 'ios';

  return (
    <ThemedView style={[styles.screen, { backgroundColor: theme.background }]}>
      <KeyboardAwareFormScroll footerInset={showFooterSubmit ? 56 : 0}>
        <View style={styles.form}>
          <ThemedText type="small" themeColor="textSecondary">
            Set how often you want to be reminded for this maintenance item.
          </ThemedText>

          <FormField
            label={`Interval (${unitLabel})`}
            description={
              standardItem.suggestDistanceKm > 0
                ? `Catalog default: ${Math.round(fromStorageKm(standardItem.suggestDistanceKm, unit))} ${unitLabel}`
                : undefined
            }
            error={fieldError ?? undefined}>
            <FormInput
              value={intervalText}
              onChangeText={setIntervalText}
              keyboardType="decimal-pad"
              placeholder={`e.g. ${standardItem.suggestDistanceKm > 0 ? Math.round(fromStorageKm(standardItem.suggestDistanceKm, unit)) : '3000'}`}
            />
          </FormField>

          {existingReminderId ? (
            <Pressable
              accessibilityRole="button"
              disabled={isBusy}
              onPress={() => void handleDelete()}
              style={{ opacity: isBusy ? 0.5 : 1 }}>
              {isDeleting ? (
                <ActivityIndicator size="small" color={theme.destructive} />
              ) : (
                <ThemedText type="small" themeColor="destructive">
                  Delete reminder
                </ThemedText>
              )}
            </Pressable>
          ) : null}

          {submitError ? (
            <ThemedText type="small" themeColor="destructive">
              {submitError}
            </ThemedText>
          ) : null}

          {showFooterSubmit ? (
            <Pressable
              accessibilityRole="button"
              disabled={isBusy}
              onPress={() => void submit()}
              style={[
                styles.submitButton,
                {
                  backgroundColor: theme.primary,
                  opacity: isBusy ? 0.7 : 1,
                },
              ]}>
              {isSubmitting ? (
                <ActivityIndicator color={theme.primaryForeground} />
              ) : (
                <ThemedText style={{ color: theme.primaryForeground }} type="smallBold">
                  Save reminder
                </ThemedText>
              )}
            </Pressable>
          ) : null}
        </View>
      </KeyboardAwareFormScroll>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  form: {
    gap: Spacing.three,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingVertical: 14,
    marginTop: Spacing.two,
  },
  headerSave: {
    marginRight: Spacing.two,
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerSaveLabel: {
    fontSize: 17,
  },
});
