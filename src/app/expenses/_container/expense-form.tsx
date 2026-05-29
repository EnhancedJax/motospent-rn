import { router, useNavigation } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';

import { DomainError, expensesService, OdometerTimelineError } from '@/app-backend';
import { ExpenseItemIcon } from '@/components/expense-item-icon';
import { KeyboardAwareFormScroll } from '@/components/keyboard-aware-form-scroll';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  FormField,
  FormInput,
  FormTextArea,
} from '@/components/ui/form';
import { Spacing } from '@/constants/theme';
import {
  buildCatalogMap,
  findFuelItemId,
  resolveExpenseDisplay,
} from '@/core/expense/expense-display';
import { sortCatalogByUsageFrequency } from '@/core/expense/sort-catalog-by-usage';
import { formatAppDate } from '@/core/format/format-app-date';
import {
  computeFuelHints,
  findPriorFuelExpense,
  formatFuelAmountForDisplay,
} from '@/core/expense/fuel-hints';
import type { ExpenseDTO, StandardExpenseItemDTO } from '@/core/database/types';
import { fromStorageKm, toStorageKm } from '@/core/units/distance';
import type { DistanceUnit } from '@/core/units/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettings } from '@/hooks/use-settings';
import { useTheme } from '@/hooks/use-theme';
import { radius } from '@/theme/radius';

import {
  expenseFormDefaultValues,
  validateExpenseForm,
  type ExpenseFormValues,
  type OdometerBounds,
} from './expense-form-schema';

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function odometerMatchesStored(
  displayOdometer: number,
  storedKm: number,
  unit: DistanceUnit,
): boolean {
  return Math.abs(toStorageKm(displayOdometer, unit) - storedKm) < 0.05;
}

type ExpenseFormProps = {
  mode: 'create' | 'edit';
  expense: ExpenseDTO | null;
  catalogItems: StandardExpenseItemDTO[];
  motorcycleId: string;
};

export function ExpenseForm({
  mode,
  expense,
  catalogItems,
  motorcycleId,
}: ExpenseFormProps) {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const { distanceUnit, volumeUnit } = useSettings();
  const distUnit = distanceUnit ?? 'km';
  const volUnit = volumeUnit ?? 'L';

  const fuelItemId = useMemo(() => findFuelItemId(catalogItems), [catalogItems]);
  const catalogById = useMemo(() => buildCatalogMap(catalogItems), [catalogItems]);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [odometerBounds, setOdometerBounds] = useState<OdometerBounds | null>(null);
  const [allExpenses, setAllExpenses] = useState<ExpenseDTO[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    defaultValues: expenseFormDefaultValues,
  });

  const itemMode = watch('itemMode');
  const listedItemId = watch('listedItemId');
  const date = watch('date');
  const odometer = watch('odometer');
  const cost = watch('cost');
  const fuelAmount = watch('fuelAmount');

  const sortedCatalogItems = useMemo(
    () => sortCatalogByUsageFrequency(catalogItems, allExpenses, 20),
    [catalogItems, allExpenses],
  );

  const filteredCatalogItems = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();
    if (!query) {
      return sortedCatalogItems;
    }
    return sortedCatalogItems.filter((item) => item.name.toLowerCase().includes(query));
  }, [sortedCatalogItems, itemSearch]);

  const isFuelSelected = itemMode === 'listed' && listedItemId === fuelItemId;

  useEffect(() => {
    setSubmitError(null);
    if (mode === 'edit' && expense) {
      const display = resolveExpenseDisplay(expense, catalogById);
      reset({
        itemMode: expense.listedItemId ? 'listed' : 'custom',
        listedItemId: expense.listedItemId ?? undefined,
        item: expense.listedItemId ? display.label : expense.item,
        date: startOfDay(expense.date),
        odometer: String(
          Math.round(fromStorageKm(expense.odometerKm, distUnit) * 10) / 10,
        ),
        cost: String(expense.cost),
        fuelAmount: formatFuelAmountForDisplay(expense.fuelAmountLiters, volUnit),
        notes: expense.notes ?? '',
      });
    } else {
      reset({
        ...expenseFormDefaultValues,
        date: Date.now(),
      });
    }
  }, [mode, expense, catalogById, reset, distUnit, volUnit]);

  useEffect(() => {
    if (!motorcycleId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const list = await expensesService.listByMotorcycle(motorcycleId);
      if (!cancelled) {
        setAllExpenses(list);
      }

      const currentOdometer = odometer.trim() ? Number(odometer) : undefined;
      const bounds = await expensesService.getOdometerBounds({
        motorcycleId,
        date,
        expenseId: expense?.id,
        currentOdometer: Number.isNaN(currentOdometer) ? undefined : currentOdometer,
      });

      if (!cancelled) {
        setOdometerBounds(bounds);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [motorcycleId, date, expense?.id, odometer]);

  const priorFuelExpense = useMemo(() => {
    if (!fuelItemId || !isFuelSelected) {
      return null;
    }
    return findPriorFuelExpense(allExpenses, fuelItemId, {
      date,
      createdAt: expense?.createdAt ?? Date.now(),
      expenseId: expense?.id,
    });
  }, [allExpenses, fuelItemId, isFuelSelected, date, expense]);

  const fuelHints = useMemo(() => {
    if (!isFuelSelected) {
      return [];
    }
    const parsedCost = Number(cost);
    const parsedOdometer = odometer.trim() ? Number(odometer) : undefined;
    const parsedFuel = fuelAmount?.trim() ? Number(fuelAmount) : undefined;

    return computeFuelHints({
      cost: Number.isNaN(parsedCost) ? 0 : parsedCost,
      fuelAmount: parsedFuel !== undefined && !Number.isNaN(parsedFuel) ? parsedFuel : undefined,
      odometer:
        parsedOdometer !== undefined && !Number.isNaN(parsedOdometer)
          ? parsedOdometer
          : undefined,
      priorFuelExpense,
      distanceUnit: distUnit,
      volumeUnit: volUnit,
    });
  }, [
    isFuelSelected,
    cost,
    odometer,
    fuelAmount,
    priorFuelExpense,
    distUnit,
    volUnit,
  ]);

  const onSubmit = handleSubmit(async (values) => {
    const normalizedValues = {
      ...values,
      date: startOfDay(values.date),
    };

    const validation = validateExpenseForm(normalizedValues, odometerBounds, fuelItemId);
    if (!validation.success) {
      for (const [key, message] of Object.entries(validation.errors)) {
        setError(key as keyof ExpenseFormValues, { message });
      }
      const firstMessage = Object.values(validation.errors)[0];
      if (firstMessage) {
        setSubmitError(firstMessage);
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { data } = validation;
      const catalogItem = data.listedItemId ? catalogById.get(data.listedItemId) : undefined;
      const itemLabel =
        data.itemMode === 'listed' ? (catalogItem?.name ?? data.item) : data.item;
      const listedItemId =
        data.itemMode === 'listed' ? data.listedItemId : '';
      const odometerUnchanged =
        expense !== null && odometerMatchesStored(data.odometer, expense.odometerKm, distUnit);
      const dateUnchanged = expense !== null && startOfDay(expense.date) === data.date;

      if (mode === 'create') {
        await expensesService.create({
          motorcycleId,
          listedItemId: data.listedItemId,
          item: itemLabel,
          cost: data.cost,
          odometer: data.odometer,
          date: data.date,
          fuelAmount: data.fuelAmount,
          notes: data.notes,
        });
        setIsSubmitting(false);
        Alert.alert('Success', 'Expense added.', [{ text: 'OK', onPress: () => router.back() }]);
        return;
      } else if (expense) {
        await expensesService.update(expense.id, {
          motorcycleId,
          listedItemId,
          item: itemLabel,
          cost: data.cost,
          odometer: odometerUnchanged ? undefined : data.odometer,
          date: dateUnchanged ? undefined : data.date,
          fuelAmount: data.fuelAmount,
          notes: data.notes,
        });
        setIsSubmitting(false);
        Alert.alert('Success', 'Expense saved.', [{ text: 'OK', onPress: () => router.back() }]);
        return;
      }
    } catch (error) {
      if (error instanceof OdometerTimelineError) {
        setError('odometer', { message: error.message });
      } else {
        const message =
          error instanceof DomainError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Failed to save expense';
        setSubmitError(message);
      }
      setIsSubmitting(false);
    }
  });

  const submit = useCallback(() => {
    void onSubmit();
  }, [onSubmit]);

  useLayoutEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={mode === 'create' ? 'Add expense' : 'Save changes'}
          disabled={isSubmitting}
          onPress={submit}
          hitSlop={8}
          style={[styles.headerSave, { opacity: isSubmitting ? 0.5 : 1 }]}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <ThemedText type="linkPrimary" style={styles.headerSaveLabel}>
              {mode === 'create' ? 'Add' : 'Save'}
            </ThemedText>
          )}
        </Pressable>
      ),
    });

    return () => {
      navigation.setOptions({ headerRight: undefined });
    };
  }, [navigation, submit, isSubmitting, theme.primary, mode]);

  const showFooterSubmit = Platform.OS !== 'ios';

  return (
    <ThemedView style={[styles.screen, { backgroundColor: theme.background }]}>
      <KeyboardAwareFormScroll footerInset={showFooterSubmit ? 56 : 0}>
        <View style={styles.form}>
          <FormField label="Item type">
            <View style={[styles.segmented, { backgroundColor: theme.muted }]}>
              {(['listed', 'custom'] as const).map((modeOption) => {
                const isSelected = itemMode === modeOption;
                return (
                  <Pressable
                    key={modeOption}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setValue('itemMode', modeOption)}
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
                      {modeOption === 'listed' ? 'Standard item' : 'Custom'}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </FormField>

          {itemMode === 'listed' ? (
            <FormField label="Standard item" error={errors.listedItemId?.message}>
              <FormInput
                value={itemSearch}
                onChangeText={setItemSearch}
                placeholder="Search items..."
                style={styles.catalogSearch}
              />
              <View style={[styles.catalogList, { borderColor: theme.border }]}>
                {filteredCatalogItems.map((item) => {
                  const isSelected = listedItemId === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => {
                        setValue('listedItemId', item.id);
                        setValue('item', item.name);
                      }}
                      style={[
                        styles.catalogRow,
                        {
                          backgroundColor: isSelected ? theme.accent : 'transparent',
                          borderBottomColor: theme.border,
                        },
                      ]}>
                      <ExpenseItemIcon iconKey={item.iconKey} />
                      <ThemedText type="default" style={styles.catalogLabel}>
                        {item.name}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </FormField>
          ) : (
            <Controller
              control={control}
              name="item"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField label="Custom item" error={errors.item?.message}>
                  <FormInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="e.g. Oil change"
                    maxLength={200}
                  />
                </FormField>
              )}
            />
          )}

          <FormField label="Date">
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.dateButton,
                { backgroundColor: theme.muted, borderColor: theme.border },
              ]}>
              <ThemedText type="default">{formatAppDate(date)}</ThemedText>
            </Pressable>
          </FormField>

          <Controller
            control={control}
            name="odometer"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label={`Odometer (${distUnit})`}
                description={
                  odometerBounds
                    ? odometerBounds.max !== null
                      ? `Allowed: ${odometerBounds.min}–${odometerBounds.max} ${distUnit}`
                      : `Minimum: ${odometerBounds.min} ${distUnit}`
                    : undefined
                }
                error={errors.odometer?.message}>
                <FormInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="cost"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField label="Cost ($)" error={errors.cost?.message}>
                <FormInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </FormField>
            )}
          />

          {isFuelSelected ? (
            <Controller
              control={control}
              name="fuelAmount"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label={`Fuel amount (${volUnit})`}
                  error={errors.fuelAmount?.message}>
                  <FormInput
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Optional"
                    keyboardType="decimal-pad"
                  />
                </FormField>
              )}
            />
          ) : null}

          {fuelHints.length > 0 ? (
            <View style={styles.hints}>
              {fuelHints.map((hint) => (
                <ThemedText key={hint} type="small" themeColor="textSecondary">
                  {hint}
                </ThemedText>
              ))}
            </View>
          ) : null}

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField label="Notes" error={errors.notes?.message}>
                <FormTextArea
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Optional notes"
                  maxLength={1000}
                />
              </FormField>
            )}
          />

          {submitError ? (
            <ThemedText type="small" themeColor="destructive">
              {submitError}
            </ThemedText>
          ) : null}

          {showFooterSubmit ? (
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={submit}
              style={[
                styles.submitButton,
                {
                  backgroundColor: theme.primary,
                  opacity: isSubmitting ? 0.7 : 1,
                },
              ]}>
              {isSubmitting ? (
                <ActivityIndicator color={theme.primaryForeground} />
              ) : (
                <ThemedText
                  style={{ color: theme.primaryForeground }}
                  type="smallBold">
                  {mode === 'create' ? 'Add expense' : 'Save changes'}
                </ThemedText>
              )}
            </Pressable>
          ) : null}
        </View>
      </KeyboardAwareFormScroll>

      <DatePicker
        modal
        open={showDatePicker}
        date={new Date(date)}
        mode="date"
        title="Expense date"
        theme={colorScheme === 'dark' ? 'dark' : 'light'}
        onConfirm={(picked) => {
          setShowDatePicker(false);
          setValue('date', startOfDay(picked.getTime()), { shouldValidate: true });
        }}
        onCancel={() => setShowDatePicker(false)}
      />
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
  segmented: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: Spacing.half,
    gap: Spacing.half,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  catalogSearch: {
    marginBottom: Spacing.two,
  },
  catalogList: {
    borderWidth: 1,
    borderRadius: radius.md,
    maxHeight: 200,
    overflow: 'hidden',
  },
  catalogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  catalogLabel: {
    flex: 1,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hints: {
    gap: Spacing.one,
    marginTop: -Spacing.two,
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
