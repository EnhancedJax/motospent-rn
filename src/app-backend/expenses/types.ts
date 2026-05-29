export type CreateExpenseInput = {
  motorcycleId: string;
  listedItemId?: string;
  item: string;
  cost: number;
  odometer: number;
  date: number;
  fuelAmount?: number;
  notes?: string;
};

export type UpdateExpenseInput = {
  motorcycleId?: string;
  listedItemId?: string;
  item?: string;
  cost?: number;
  odometer?: number;
  date?: number;
  fuelAmount?: number;
  notes?: string;
};
