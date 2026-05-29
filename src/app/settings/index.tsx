import { DistanceUnitPicker } from '@/components/settings/distance-unit-picker';
import { ScreenLayout } from '@/components/screen-layout';
import { Spacing } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <ScreenLayout
      title="Settings"
      subtitle="Preferences, currency, and app configuration.">
      <View style={styles.content}>
        <DistanceUnitPicker />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
});
