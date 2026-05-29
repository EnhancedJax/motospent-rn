import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { MotorcycleForm } from "@/app/dashboard/_container/motorcycle-form";
import { useMotorcycles } from "@/hooks/use-motorcycles";
import { useTheme } from "@/hooks/use-theme";

export default function MotorcycleFormScreen() {
  const theme = useTheme();
  const { mode, motorcycleId } = useLocalSearchParams<{
    mode?: string;
    motorcycleId?: string;
  }>();
  const { motorcycles, isLoading } = useMotorcycles();

  const formMode = mode === "edit" ? "edit" : "create";
  const motorcycle =
    formMode === "edit" && motorcycleId
      ? (motorcycles.find((m) => m.id === motorcycleId) ?? null)
      : null;

  useEffect(() => {
    if (formMode === "edit" && !isLoading && motorcycleId && !motorcycle) {
      router.back();
    }
  }, [formMode, isLoading, motorcycle, motorcycleId]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: formMode === "create" ? "Add motorcycle" : "Edit motorcycle",
          headerShown: true,
          contentStyle: { flex: 1, backgroundColor: theme.background },
        }}
      />
      <MotorcycleForm
        mode={formMode}
        motorcycle={motorcycle}
        isFirstMotorcycle={motorcycles.length === 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
