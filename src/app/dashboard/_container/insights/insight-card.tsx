import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Card, CardContent } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';

type InsightCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export function InsightCard({ children, style, contentStyle, onPress }: InsightCardProps) {
  const card = (
    <Card size="sm" style={[styles.card, style]}>
      <CardContent style={[styles.content, contentStyle]}>{children}</CardContent>
    </Card>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={style}>
        <Card size="sm" style={styles.card}>
          <CardContent style={[styles.content, contentStyle]}>{children}</CardContent>
        </Card>
      </Pressable>
    );
  }

  return card;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
  },
  content: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
  },
});
