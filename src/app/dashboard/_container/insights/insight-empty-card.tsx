import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';

import { InsightCard } from './insight-card';

type InsightEmptyCardProps = {
  message: string;
};

export function InsightEmptyCard({ message }: InsightEmptyCardProps) {
  return (
    <InsightCard style={styles.card}>
      <ThemedText type="default" themeColor="textSecondary" style={styles.message}>
        {message}
      </ThemedText>
    </InsightCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: undefined,
    minWidth: undefined,
  },
  message: {
    lineHeight: 22,
  },
});
