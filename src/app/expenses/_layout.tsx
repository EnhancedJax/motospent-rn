import { Stack } from 'expo-router';

import { formSheetScreenOptions } from '@/navigation/form-sheet-options';

export default function ExpensesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="expense-form" options={formSheetScreenOptions} />
    </Stack>
  );
}
