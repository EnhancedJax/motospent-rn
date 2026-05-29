import { router } from 'expo-router';

import type { MotorcycleDTO } from '@/core/database/types';

export function openMotorcycleForm(params: { mode: 'create' | 'edit'; motorcycleId?: string }) {
  router.push({
    pathname: '/dashboard/motorcycle-form',
    params: {
      mode: params.mode,
      ...(params.motorcycleId ? { motorcycleId: params.motorcycleId } : {}),
    },
  });
}

export function sortMotorcyclesForCarousel(motorcycles: MotorcycleDTO[]): MotorcycleDTO[] {
  const primary = motorcycles.find((m) => m.isPrimary);
  const others = motorcycles
    .filter((m) => !m.isPrimary)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (primary) {
    return [primary, ...others];
  }
  return others;
}

export function resolveSelectedMotorcycleId(
  motorcycles: MotorcycleDTO[],
  currentId: string | null,
): string | null {
  if (motorcycles.length === 0) {
    return null;
  }
  if (currentId && motorcycles.some((m) => m.id === currentId)) {
    return currentId;
  }
  const primary = motorcycles.find((m) => m.isPrimary);
  return primary?.id ?? motorcycles[0].id;
}
