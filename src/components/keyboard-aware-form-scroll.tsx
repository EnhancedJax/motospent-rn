import { useHeaderHeight } from '@react-navigation/elements';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';

type KeyboardAwareFormScrollProps = {
  children: React.ReactNode;
  /** Extra bottom space (e.g. Android footer submit button). */
  footerInset?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function KeyboardAwareFormScroll({
  children,
  footerInset = 0,
  contentContainerStyle,
}: KeyboardAwareFormScrollProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const keyboardVerticalOffset =
    Platform.OS === 'ios' ? (headerHeight > 0 ? headerHeight : 88) : 0;
  const paddingTop =
    Platform.OS === 'ios' ? keyboardVerticalOffset + Spacing.two : Spacing.three;
  const paddingBottom =
    Math.max(insets.bottom, Spacing.four) + footerInset + Spacing.six;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop, paddingBottom },
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
  },
});
