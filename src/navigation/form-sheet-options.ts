/** Full-height form sheets (motorcycle, expense). */
export const formSheetScreenOptions = {
  presentation: 'formSheet' as const,
  headerShown: true,
  sheetGrabberVisible: true,
  sheetAllowedDetents: [1] as number[],
  sheetInitialDetentIndex: 0,
  contentStyle: { flex: 1 },
};

/** Compact maintenance reminder — opens at minimum height, expandable to full. */
export const maintenanceReminderFormSheetOptions = {
  presentation: 'formSheet' as const,
  headerShown: true,
  sheetGrabberVisible: true,
  sheetAllowedDetents: [0.4, 1] as number[],
  sheetInitialDetentIndex: 0,
  contentStyle: { flex: 1 },
};

/** List picker sheets (e.g. average spending category). */
export const pickerSheetScreenOptions = {
  presentation: 'formSheet' as const,
  headerShown: true,
  sheetGrabberVisible: true,
  sheetAllowedDetents: [0.55, 1] as number[],
  sheetInitialDetentIndex: 0,
  contentStyle: { flex: 1 },
};
