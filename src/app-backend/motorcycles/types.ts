export type CreateMotorcycleInput = {
  name: string;
  notes?: string;
  purchasePrice?: number;
  purchaseDate?: number;
  odometerAtAddition: number;
  imageUrl?: string;
};

export type UpdateMotorcycleInput = {
  name?: string;
  notes?: string;
  purchasePrice?: number;
  purchaseDate?: number;
  odometerAtAddition?: number;
  imageUrl?: string;
};
