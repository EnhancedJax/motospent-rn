import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const PILL_RADIUS = 9999;

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Shrink-wrap segments instead of stretching equally (e.g. settings rows). */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  compact = false,
  style,
}: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        { backgroundColor: theme.muted },
        style,
      ]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              compact && styles.segmentCompact,
              selected && { backgroundColor: theme.card },
            ]}
          >
            <ThemedText
              type="small"
              themeColor={selected ? "text" : "textSecondary"}
              style={styles.label}
            >
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    flexDirection: "row",
    borderRadius: PILL_RADIUS,
    padding: Spacing.one,
    gap: Spacing.one,
  },
  containerCompact: {
    alignSelf: "auto",
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    borderRadius: PILL_RADIUS,
  },
  segmentCompact: {
    flex: undefined,
    minWidth: 44,
  },
  label: {
    textAlign: "center",
  },
});
