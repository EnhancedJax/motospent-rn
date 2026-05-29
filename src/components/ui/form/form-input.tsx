import React from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

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
          backgroundColor: theme.card,
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
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
});
