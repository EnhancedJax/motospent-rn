import { Stack } from "expo-router";

import {
  formSheetScreenOptions,
  maintenanceReminderFormSheetOptions,
  pickerSheetScreenOptions,
} from "@/navigation/form-sheet-options";

export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="motorcycle-form" options={formSheetScreenOptions} />
      <Stack.Screen
        name="maintenance-reminder-form"
        options={maintenanceReminderFormSheetOptions}
      />
      <Stack.Screen
        name="average-spending-category"
        options={pickerSheetScreenOptions}
      />
    </Stack>
  );
}
