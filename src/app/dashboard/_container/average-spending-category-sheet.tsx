import { Check } from 'phosphor-react-native';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ExpenseItemIcon } from '@/components/expense-item-icon';
import { ThemedText } from '@/components/themed-text';
import { Card, CardContent } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import {
  ALL_CATEGORIES_KEY,
  discoverCategories,
  resolveDefaultCategoryKey,
} from '@/core/dashboard/category-label';
import { isAnalyticsExpense } from '@/core/dashboard/expense-filters';
import { buildCatalogMap, findFuelItemId } from '@/core/expense/expense-display';
import { useExpenses } from '@/hooks/use-expenses';
import { useStandardExpenseItems } from '@/hooks/use-standard-expense-items';
import { useTheme } from '@/hooks/use-theme';
import { useDashboardInsightsStore } from '@/stores/dashboard-insights-store';

type AverageSpendingCategorySheetProps = {
  motorcycleId?: string;
};

export function AverageSpendingCategorySheet({
  motorcycleId,
}: AverageSpendingCategorySheetProps) {
  const theme = useTheme();
  const categoryKey = useDashboardInsightsStore((state) => state.averageSpendingCategory);
  const setCategoryKey = useDashboardInsightsStore((state) => state.setAverageSpendingCategory);
  const storedCategoryOptions = useDashboardInsightsStore((state) => state.categoryOptions);

  const { expenses, isLoading: isLoadingExpenses } = useExpenses(motorcycleId ?? null);
  const { items: catalogItems } = useStandardExpenseItems();
  const catalogById = useMemo(() => buildCatalogMap(catalogItems), [catalogItems]);
  const fuelItemId = useMemo(() => findFuelItemId(catalogItems), [catalogItems]);

  const computedCategoryOptions = useMemo(() => {
    const analyticsExpenses = expenses.filter(isAnalyticsExpense);
    const categories = discoverCategories(analyticsExpenses, catalogById);
    return [
      { key: ALL_CATEGORIES_KEY, label: 'All categories', iconKey: null },
      ...categories.map((category) => ({
        key: category.key,
        label: category.label,
        iconKey: category.iconKey,
      })),
    ];
  }, [expenses, catalogById]);

  const categoryOptions =
    storedCategoryOptions.length > 0 ? storedCategoryOptions : computedCategoryOptions;

  const defaultCategoryKey = useMemo(() => {
    const analyticsExpenses = expenses.filter(isAnalyticsExpense);
    const categories = discoverCategories(analyticsExpenses, catalogById);
    return resolveDefaultCategoryKey(categories, fuelItemId, catalogById);
  }, [expenses, catalogById, fuelItemId]);

  const effectiveCategoryKey = categoryKey || defaultCategoryKey;
  const isLoading = Boolean(motorcycleId) && isLoadingExpenses && categoryOptions.length === 0;

  const selectCategory = (key: string) => {
    setCategoryKey(key);
    router.back();
  };

  if (!motorcycleId) {
    return (
      <View style={styles.centered}>
        <ThemedText type="default" themeColor="textSecondary">
          Select a motorcycle on the dashboard first.
        </ThemedText>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <Card size="sm" style={styles.card}>
        <CardContent style={styles.cardContent}>
          {categoryOptions.map((option, index) => {
            const selected = option.key === effectiveCategoryKey;
            const isLast = index === categoryOptions.length - 1;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => selectCategory(option.key)}
                style={[
                  styles.option,
                  !isLast && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.border,
                  },
                ]}>
                <ExpenseItemIcon iconKey={option.iconKey} size={20} />
                <ThemedText type="default" style={styles.optionLabel}>
                  {option.label}
                </ThemedText>
                {selected ? (
                  <Check size={20} color={theme.primary} weight="bold" />
                ) : (
                  <View style={styles.checkPlaceholder} />
                )}
              </Pressable>
            );
          })}
        </CardContent>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: {
    alignSelf: 'stretch',
  },
  cardContent: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    gap: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  optionLabel: {
    flex: 1,
  },
  checkPlaceholder: {
    width: 20,
    height: 20,
  },
});
