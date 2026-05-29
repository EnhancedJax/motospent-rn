import { DistanceUnitPicker } from "@/app/settings/container/distance-unit-picker";
import { PageShell } from "@/components/page-shell";
import { Spacing } from "@/constants/theme";
import { StyleSheet } from "react-native";

export default function SettingsScreen() {
  return (
    <PageShell>
      <PageShell.Header
        title="Settings"
        subtitle="Preferences, currency, and app configuration."
      />
      <PageShell.Content style={styles.content}>
        <DistanceUnitPicker />
      </PageShell.Content>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
});
