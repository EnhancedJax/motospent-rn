import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="motorcycle-form"
        options={{
          presentation: "formSheet",
          headerShown: true,
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.92, 1],
          sheetInitialDetentIndex: 1,
          contentStyle: { flex: 1 },
        }}
      />
    </Stack>
  );
}
