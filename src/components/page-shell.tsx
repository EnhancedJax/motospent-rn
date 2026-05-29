import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PageShellProps = {
  children: React.ReactNode;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

function PageShellRoot({
  children,
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
}: PageShellProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const scrollBottomPadding = insets.bottom + BottomTabInset + Spacing.six;

  return (
    <ThemedView
      style={[
        styles.screen,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
        },
      ]}>
      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollBottomPadding },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}>
        {children}
      </ScrollView>
    </ThemedView>
  );
}

type PageShellHeaderProps = {
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
};

function PageShellHeader({ title, subtitle, headerRight }: PageShellHeaderProps) {
  const insets = useSafeAreaInsets();
  const horizontalPadding = Math.max(insets.left, insets.right, Spacing.four);

  return (
    <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <ThemedText type="subtitle">{title}</ThemedText>
          {subtitle ? (
            <ThemedText style={styles.subtitle} themeColor="textSecondary">
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
        {headerRight}
      </View>
    </View>
  );
}

type PageShellContentProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

function PageShellContent({ children, style }: PageShellContentProps) {
  const insets = useSafeAreaInsets();
  const horizontalPadding = Math.max(insets.left, insets.right, Spacing.four);

  return (
    <View
      style={[
        styles.content,
        {
          paddingLeft: horizontalPadding,
          paddingRight: horizontalPadding,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

type PageShellFullBleedProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

function PageShellFullBleed({ children, style }: PageShellFullBleedProps) {
  return <View style={[styles.fullBleed, style]}>{children}</View>;
}

export const PageShell = Object.assign(PageShellRoot, {
  Header: PageShellHeader,
  Content: PageShellContent,
  FullBleed: PageShellFullBleed,
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
    gap: Spacing.two,
    minWidth: 0,
  },
  subtitle: {
    lineHeight: 22,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  fullBleed: {
    width: '100%',
  },
});

export type { PageShellProps };
