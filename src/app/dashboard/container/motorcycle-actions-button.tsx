import { DotsThreeVertical } from 'phosphor-react-native';
import React from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { motorcyclesService } from '@/app-backend';
import { Spacing } from '@/constants/theme';
import type { MotorcycleDTO } from '@/core/database/types';
import { useTheme } from '@/hooks/use-theme';

type MotorcycleActionsButtonProps = {
  selectedMotorcycle: MotorcycleDTO | null;
  onAdd: () => void;
  onEdit: () => void;
};

export function MotorcycleActionsButton({
  selectedMotorcycle,
  onAdd,
  onEdit,
}: MotorcycleActionsButtonProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const horizontalInset = Math.max(insets.right, Spacing.four);

  const confirmDelete = () => {
    if (!selectedMotorcycle) {
      return;
    }

    Alert.alert(
      'Delete motorcycle',
      `Delete "${selectedMotorcycle.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void motorcyclesService.delete(selectedMotorcycle.id);
          },
        },
      ],
    );
  };

  const openMenu = () => {
    const options: { text: string; onPress?: () => void; style?: 'destructive' | 'cancel' }[] = [
      { text: 'Add motorcycle', onPress: onAdd },
    ];

    if (selectedMotorcycle) {
      options.push({ text: 'Edit motorcycle', onPress: onEdit });
      options.push({ text: 'Delete motorcycle', onPress: confirmDelete, style: 'destructive' });
    }

    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Motorcycle', undefined, options);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Motorcycle actions"
      onPress={openMenu}
      style={[styles.button, { backgroundColor: 'rgba(0, 0, 0, 0.35)', right: horizontalInset }]}
      hitSlop={8}>
      <DotsThreeVertical size={22} color={theme.card} weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: Spacing.two,
    borderRadius: 20,
    padding: Spacing.two,
  },
});
