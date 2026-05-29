import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

type FormFieldProps = ViewProps & {
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
};

export function FormField({
  label,
  description,
  error,
  children,
  style,
  ...props
}: FormFieldProps) {
  return (
    <View style={[styles.field, style]} {...props}>
      <ThemedText type="small">{label}</ThemedText>
      {description ? (
        <ThemedText type="small" themeColor="textSecondary">
          {description}
        </ThemedText>
      ) : null}
      {children}
      {error ? (
        <ThemedText type="small" themeColor="destructive">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
});
