import { z } from 'zod';

function optionalString() {
  return z.preprocess(
    (value) => (value === null || value === undefined ? undefined : String(value)),
    z.string().optional(),
  );
}

export const motorcycleFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  odometerAtAddition: z.string(),
  notes: optionalString(),
  purchasePrice: optionalString(),
  purchaseDate: z.number().nullish(),
  imageUrl: optionalString(),
  isPrimary: z.boolean(),
});

export type MotorcycleFormValues = z.infer<typeof motorcycleFormSchema>;

export const motorcycleFormDefaultValues: MotorcycleFormValues = {
  name: '',
  odometerAtAddition: '',
  notes: '',
  purchasePrice: '',
  purchaseDate: undefined,
  imageUrl: undefined,
  isPrimary: false,
};

export function isValidImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) {
    return true;
  }
  if (trimmed.startsWith('file://')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return undefined;
  }
  return parsed;
}

export type ValidatedMotorcycleForm = Omit<
  MotorcycleFormValues,
  'purchasePrice' | 'purchaseDate' | 'imageUrl' | 'notes'
> & {
  notes?: string;
  purchaseDate?: number;
  imageUrl?: string;
  odometer?: number;
  purchasePrice?: number;
};

export function validateMotorcycleForm(
  values: MotorcycleFormValues,
  mode: 'create' | 'edit',
):
  | { success: true; data: ValidatedMotorcycleForm }
  | { success: false; errors: Partial<Record<keyof MotorcycleFormValues, string>> } {
  const parsed = motorcycleFormSchema.safeParse(values);
  if (!parsed.success) {
    const errors: Partial<Record<keyof MotorcycleFormValues, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof MotorcycleFormValues;
      if (!errors[key]) {
        errors[key] = issue.message;
      }
    }
    return { success: false, errors };
  }

  const errors: Partial<Record<keyof MotorcycleFormValues, string>> = {};
  let odometer: number | undefined;

  if (mode === 'create') {
    if (!values.odometerAtAddition.trim()) {
      errors.odometerAtAddition = 'Odometer is required';
    } else {
      const parsedOdometer = Number(values.odometerAtAddition);
      if (Number.isNaN(parsedOdometer) || parsedOdometer < 0) {
        errors.odometerAtAddition = 'Enter a valid odometer reading';
      } else {
        odometer = parsedOdometer;
      }
    }
  } else if (values.odometerAtAddition.trim()) {
    const parsedOdometer = Number(values.odometerAtAddition);
    if (Number.isNaN(parsedOdometer) || parsedOdometer < 0) {
      errors.odometerAtAddition = 'Enter a valid odometer reading';
    } else {
      odometer = parsedOdometer;
    }
  }

  const purchasePrice = parseOptionalNumber(values.purchasePrice);
  if (values.purchasePrice?.trim() && purchasePrice === undefined) {
    errors.purchasePrice = 'Enter a valid price';
  }

  const imageUrl = values.imageUrl?.trim();
  if (imageUrl && !isValidImageUrl(imageUrl)) {
    errors.imageUrl = 'Enter a valid image URL (https://...)';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const {
    purchasePrice: _purchasePriceStr,
    purchaseDate,
    notes: notesValue,
    imageUrl: _imageUrl,
    ...rest
  } = parsed.data;
  const data: ValidatedMotorcycleForm = {
    ...rest,
    odometer,
    notes: notesValue?.trim() || undefined,
    purchaseDate: purchaseDate ?? undefined,
    imageUrl: imageUrl || undefined,
    ...(purchasePrice !== undefined ? { purchasePrice } : {}),
  };

  return { success: true, data };
}
