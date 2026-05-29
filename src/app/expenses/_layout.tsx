import { Stack } from 'expo-router';

export default function ExpensesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="expense-form"
        options={{
          presentation: 'formSheet',
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
