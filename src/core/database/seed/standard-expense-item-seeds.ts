export type StandardExpenseItemSeed = {
  name: string;
  suggestDistanceKm: number;
  iconKey: string;
  countsTowardMaintenanceRecency: boolean;
};

export const STANDARD_EXPENSE_ITEM_SEEDS: StandardExpenseItemSeed[] = [
  {
    name: 'Chain clean, check & lube',
    suggestDistanceKm: 1000,
    iconKey: 'LinkSimple',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Chain replace',
    suggestDistanceKm: 40000,
    iconKey: 'LinkSimple',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Engine oil & filter change',
    suggestDistanceKm: 3000,
    iconKey: 'Drop',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Air filter clean/inspect',
    suggestDistanceKm: 8000,
    iconKey: 'Wind',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Air filter replace',
    suggestDistanceKm: 20000,
    iconKey: 'Wind',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Tire replace (rear)',
    suggestDistanceKm: 8000,
    iconKey: 'CircleHalf',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Tire replace (front)',
    suggestDistanceKm: 12000,
    iconKey: 'CircleHalf',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Tire pressure adjustment',
    suggestDistanceKm: 2000,
    iconKey: 'CircleHalf',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Brake pads inspection',
    suggestDistanceKm: 10000,
    iconKey: 'Disc',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Brake pads replace',
    suggestDistanceKm: 30000,
    iconKey: 'Disc',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Brake fluid flush',
    suggestDistanceKm: 40000,
    iconKey: 'Drop',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Spark plugs inspect',
    suggestDistanceKm: 12000,
    iconKey: 'Lightning',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Spark plugs replace',
    suggestDistanceKm: 24000,
    iconKey: 'Lightning',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Coolant flush & replace',
    suggestDistanceKm: 40000,
    iconKey: 'Thermometer',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Valve clearance check/adjust',
    suggestDistanceKm: 40000,
    iconKey: 'SlidersHorizontal',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Fuel filter replace',
    suggestDistanceKm: 40000,
    iconKey: 'Funnel',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Fork oil change',
    suggestDistanceKm: 40000,
    iconKey: 'ForkKnife',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Drive belt inspection',
    suggestDistanceKm: 8000,
    iconKey: 'WaveSawtooth',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Drive belt replace',
    suggestDistanceKm: 100000,
    iconKey: 'WaveSawtooth',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Shaft drive oil change',
    suggestDistanceKm: 20000,
    iconKey: 'ArrowsHorizontal',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Wheel bearings inspect/repack',
    suggestDistanceKm: 30000,
    iconKey: 'CircleDashed',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Steering head bearings service',
    suggestDistanceKm: 40000,
    iconKey: 'SteeringWheel',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Suspension (forks/shock) service',
    suggestDistanceKm: 50000,
    iconKey: 'ArrowBendDoubleUpRight',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Battery check',
    suggestDistanceKm: 12000,
    iconKey: 'BatteryHigh',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Battery replace',
    suggestDistanceKm: 60000,
    iconKey: 'BatteryWarning',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Fuel lines / brake hoses inspect',
    suggestDistanceKm: 40000,
    iconKey: 'Pipe',
    countsTowardMaintenanceRecency: true,
  },
  {
    name: 'Insurance (premium / renewal)',
    suggestDistanceKm: -1,
    iconKey: 'ShieldCheck',
    countsTowardMaintenanceRecency: false,
  },
  {
    name: 'Fuel / gas',
    suggestDistanceKm: -1,
    iconKey: 'GasPump',
    countsTowardMaintenanceRecency: false,
  },
];
