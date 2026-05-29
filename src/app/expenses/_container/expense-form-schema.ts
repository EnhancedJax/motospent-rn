import { z } from 'zod';

export type ExpenseItemMode = 'listed' | 'custom';

function optionalString() {
  return z.preprocess(
    (value) => (value === null || value === undefined ? undefined : String(value)),
    z.string().optional(),
  );
}

function requiredString() {
  return z.preprocess(
    (value) => (value === null || value === undefined ? '' : String(value)),
    z.string(),
  );
}

export const expenseFormSchema = z.object({
  itemMode: z.enum(['listed', 'custom']),
  listedItemId: optionalString(),
  item: requiredString(),
  date: z.number(),
  odometer: requiredString(),
  cost: requiredString(),
  fuelAmount: optionalString(),
  notes: optionalString(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export const expenseFormDefaultValues: ExpenseFormValues = {
  itemMode: 'listed',
  listedItemId: undefined,
  item: '',
  date: Date.now(),
  odometer: '',
  cost: '',
  fuelAmount: '',
  notes: '',
};

export type ValidatedExpenseForm = {
  itemMode: ExpenseItemMode;
  listedItemId?: string;
  item: string;
  date: number;
  odometer: number;
  cost: number;
  fuelAmount?: number;
  notes?: string;
};

export type OdometerBounds = {
  min: number;
  max: number | null;
  suggested: number;
};

/** Tolerance for display-unit odometer comparisons (rounding / unit conversion). */
const ODOMETER_DISPLAY_EPSILON = 0.15;

function parseOptionalPositiveNumber(value: string | undefined): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return undefined;
  }
  return parsed;
}

function parseNonNegativeNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return undefined;
  }
  return parsed;
}

export function validateExpenseForm(
  values: ExpenseFormValues,
  bounds: OdometerBounds | null,
  fuelItemId: string | undefined,
): | { success: true; data: ValidatedExpenseForm }
  | { success: false; errors: Partial<Record<keyof ExpenseFormValues, string>> } {
  const parsed = expenseFormSchema.safeParse(values);
  if (!parsed.success) {
    const errors: Partial<Record<keyof ExpenseFormValues, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ExpenseFormValues;
      if (!errors[key]) {
        errors[key] = issue.message;
      }
    }
    return { success: false, errors };
  }

  const errors: Partial<Record<keyof ExpenseFormValues, string>> = {};

  if (values.itemMode === 'listed') {
    if (!values.listedItemId) {
      errors.listedItemId = 'Select a standard item';
    }
  } else {
    const trimmed = values.item.trim();
    if (!trimmed) {
      errors.item = 'Item is required';
    } else if (trimmed.length > 200) {
      errors.item = 'Item must be 200 characters or fewer';
    }
  }

  const odometer = parseNonNegativeNumber(values.odometer);
  if (odometer === undefined) {
    errors.odometer = 'Enter a valid odometer reading';
  }

  const cost = parseNonNegativeNumber(values.cost);
  if (cost === undefined) {
    errors.cost = 'Enter a valid cost';
  }

  const fuelAmount = parseOptionalPositiveNumber(values.fuelAmount);
  if (values.fuelAmount?.trim() && fuelAmount === undefined) {
    errors.fuelAmount = 'Fuel amount must be greater than 0';
  }

  const notes = values.notes?.trim();
  if (notes && notes.length > 1000) {
    errors.notes = 'Notes must be 1000 characters or fewer';
  }

  if (bounds && odometer !== undefined) {
    if (odometer < bounds.min - ODOMETER_DISPLAY_EPSILON) {
      errors.odometer = `Odometer must be at least ${bounds.min}`;
    }
    if (bounds.max !== null && odometer > bounds.max + ODOMETER_DISPLAY_EPSILON) {
      errors.odometer = `Odometer cannot exceed ${bounds.max}`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const isFuel =
    values.itemMode === 'listed' && values.listedItemId === fuelItemId;

  return {
    success: true,
    data: {
      itemMode: values.itemMode,
      listedItemId: values.itemMode === 'listed' ? values.listedItemId : undefined,
      item: values.itemMode === 'custom' ? values.item.trim() : values.item,
      date: values.date,
      odometer: odometer!,
      cost: cost!,
      fuelAmount: isFuel ? fuelAmount : undefined,
      notes: notes || undefined,
    },
  };
}
