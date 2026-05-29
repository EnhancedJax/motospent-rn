import { useTheme } from "@/hooks/use-theme";
import * as React from "react";
import { StyleSheet, Text, TextProps, View, ViewProps } from "react-native";

type CardSize = "default" | "sm";

interface CardProps extends ViewProps {
  size?: CardSize;
  children: React.ReactNode;
}

function Card({ size = "default", style, children, ...props }: CardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          shadowColor: theme.border,
          borderRadius: 24,
          paddingVertical: size === "sm" ? 16 : 24,
          gap: size === "sm" ? 12 : 24,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

interface CardHeaderProps extends ViewProps {
  children: React.ReactNode;
}

function CardHeader({ style, children, ...props }: CardHeaderProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.cardHeader,
        {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 24,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

interface CardTitleProps extends TextProps {
  children: React.ReactNode;
}

function CardTitle({ style, children, ...props }: CardTitleProps) {
  const theme = useTheme();
  return (
    <Text
      style={[
        styles.cardTitle,
        { color: theme.cardForeground, fontFamily: theme.sans.semibold },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

interface CardDescriptionProps extends TextProps {
  children: React.ReactNode;
}

function CardDescription({ style, children, ...props }: CardDescriptionProps) {
  const theme = useTheme();
  return (
    <Text
      style={[
        styles.cardDescription,
        { color: theme.mutedForeground, fontFamily: theme.sans.regular },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

interface CardActionProps extends ViewProps {
  children: React.ReactNode;
}

function CardAction({ style, children, ...props }: CardActionProps) {
  return (
    <View style={[styles.cardAction, style]} {...props}>
      {children}
    </View>
  );
}

interface CardContentProps extends ViewProps {
  children: React.ReactNode;
}

function CardContent({ style, children, ...props }: CardContentProps) {
  return (
    <View style={[styles.cardContent, style]} {...props}>
      {children}
    </View>
  );
}

interface CardFooterProps extends ViewProps {
  children: React.ReactNode;
}

function CardFooter({ style, children, ...props }: CardFooterProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.cardFooter,
        {
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          paddingHorizontal: 24,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    overflow: "hidden",
    // shadow settings, use platform-specific if needed
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 0,
    gap: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: 14,
    color: "#888",
  },
  cardAction: {
    alignSelf: "flex-end",
    justifyContent: "flex-start",
  },
  cardContent: {
    paddingHorizontal: 24,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 0,
  },
});

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
