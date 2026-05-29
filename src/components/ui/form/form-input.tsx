import React from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { radius } from '@/theme/radius';

export type FormInputProps = TextInputProps;

export const FormInput = React.forwardRef<TextInput, FormInputProps>(function FormInput(
  { style, ...props },
  ref,
) {
  const theme = useTheme();

  return (
    <TextInput
      ref={ref}
      placeholderTextColor={theme.mutedForeground}
      style={[
        styles.input,
        {
          backgroundColor: theme.muted,
          borderColor: theme.border,
          color: theme.foreground,
          fontFamily: theme.sans.medium,
        },
        style,
      ]}
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
});
