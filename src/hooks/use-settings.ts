import { useSettingsStore } from '@/stores/settings-store';

export function useSettings() {
  const distanceUnit = useSettingsStore((state) => state.distanceUnit);
  const setDistanceUnit = useSettingsStore((state) => state.setDistanceUnit);
  const isLoading = useSettingsStore((state) => state.isLoading);

  return { distanceUnit, setDistanceUnit, isLoading };
}
