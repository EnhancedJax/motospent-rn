import React from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenLayoutProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export function ScreenLayout({ title, subtitle, children }: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: Platform.select({ web: Spacing.five, default: Spacing.four }),
          paddingBottom: insets.bottom + BottomTabInset + Spacing.three,
          paddingLeft: Math.max(insets.left, Spacing.four),
          paddingRight: Math.max(insets.right, Spacing.four),
        },
      ]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">{title}</ThemedText>
          {subtitle ? (
            <ThemedText style={styles.subtitle} themeColor="textSecondary">
              {subtitle}
            </ThemedText>
          ) : null}
        </ThemedView>
        {children}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    alignSelf: 'stretch',
  },
  header: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  subtitle: {
    lineHeight: 22,
  },
});
