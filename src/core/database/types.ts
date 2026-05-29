export type SettingDTO = {
  key: string;
  value: string;
};

export type MotorcycleDTO = {
  id: string;
  name: string;
  notes?: string;
  purchasePrice?: number;
  purchaseDate?: number;
  odometerAtAdditionKm: number;
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
};

export type CreateMotorcycleRepositoryInput = {
  name: string;
  notes?: string;
  purchasePrice?: number;
  purchaseDate?: number;
  odometerAtAdditionKm: number;
  imageUrl?: string;
};

export type UpdateMotorcycleRepositoryInput = Partial<CreateMotorcycleRepositoryInput>;

export type ExpenseDTO = {
  id: string;
  motorcycleId: string;
  listedItemId?: string;
  item: string;
  cost: number;
  odometerKm: number;
  date: number;
  fuelAmountLiters?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

export type CreateExpenseRepositoryInput = {
  motorcycleId: string;
  listedItemId?: string;
  item: string;
  cost: number;
  odometerKm: number;
  date: number;
  fuelAmountLiters?: number;
  notes?: string;
};

export type UpdateExpenseRepositoryInput = Partial<CreateExpenseRepositoryInput>;

export type MaintenanceReminderDTO = {
  id: string;
  motorcycleId: string;
  standardItemId: string;
  intervalDistanceKm: number;
  createdAt: number;
  updatedAt: number;
};

export type CreateMaintenanceReminderRepositoryInput = {
  motorcycleId: string;
  standardItemId: string;
  intervalDistanceKm: number;
};

export type UpdateMaintenanceReminderRepositoryInput = {
  intervalDistanceKm: number;
};

export type StandardExpenseItemDTO = {
  id: string;
  name: string;
  iconKey: string;
  suggestDistanceKm: number;
  countsTowardMaintenanceRecency: boolean;
  createdAt: number;
  updatedAt: number;
};
