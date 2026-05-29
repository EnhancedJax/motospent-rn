import React from 'react';
import { StyleSheet } from 'react-native';

import { CardDescription, CardTitle } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';

import { InsightCard } from './insight-card';

type InsightMetricCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  spread?: string;
};

export function InsightMetricCard({ title, value, subtitle, spread }: InsightMetricCardProps) {
  return (
    <InsightCard>
      <CardDescription>{title}</CardDescription>
      <CardTitle style={styles.value}>{value}</CardTitle>
      {spread ? (
        <ThemedText type="small" themeColor="textSecondary">
          {spread}
        </ThemedText>
      ) : null}
      {subtitle ? (
        <ThemedText type="small" themeColor="textSecondary">
          {subtitle}
        </ThemedText>
      ) : null}
    </InsightCard>
  );
}

const styles = StyleSheet.create({
  value: {
    fontSize: 22,
    lineHeight: 28,
  },
});
