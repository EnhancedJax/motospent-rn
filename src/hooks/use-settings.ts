import { useSettingsStore } from '@/stores/settings-store';

export function useSettings() {
  const distanceUnit = useSettingsStore((state) => state.distanceUnit);
  const volumeUnit = useSettingsStore((state) => state.volumeUnit);
  const setDistanceUnit = useSettingsStore((state) => state.setDistanceUnit);
  const isLoading = useSettingsStore((state) => state.isLoading);

  return { distanceUnit, volumeUnit, setDistanceUnit, isLoading };
}
