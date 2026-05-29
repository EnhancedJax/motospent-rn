import { Check } from 'phosphor-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ExpenseItemIcon } from '@/components/expense-item-icon';
import { ThemedText } from '@/components/themed-text';
import { Card, CardContent } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AverageSpendingCategoryOption } from '@/stores/dashboard-insights-store';

type AverageSpendingCategoryPickerProps = {
  options: AverageSpendingCategoryOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
};

export function AverageSpendingCategoryPicker({
  options,
  selectedKey,
  onSelect,
}: AverageSpendingCategoryPickerProps) {
  const theme = useTheme();

  return (
    <Card size="sm" style={styles.card}>
      <CardContent style={styles.cardContent}>
        {options.map((option, index) => {
          const selected = option.key === selectedKey;
          const isLast = index === options.length - 1;
          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onSelect(option.key)}
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
  );
}

const styles = StyleSheet.create({
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
