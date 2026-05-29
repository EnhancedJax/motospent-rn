import React from "react";
import { StyleSheet, View } from "react-native";

import { openMaintenanceReminderForm } from "@/app/dashboard/_container/maintenance-reminder-utils";
import { ExpenseItemIcon } from "@/components/expense-item-icon";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import type {
  MaintenanceRecencyItem,
  MaintenanceRecencyResult,
} from "@/core/dashboard/types";
import { formatAppDate } from "@/core/format/format-app-date";
import { formatDistance } from "@/core/units/format-distance";
import type { DistanceUnit } from "@/core/units/types";
import { useTheme } from "@/hooks/use-theme";
import { radius } from "@/theme/radius";

import { SectionTitle } from "../../../../components/section-title";
import { InsightCard } from "./insight-card";
import { InsightEmptyCard } from "./insight-empty-card";

type MaintenanceRecencySectionProps = {
  result: MaintenanceRecencyResult;
  motorcycleId: string;
  distanceUnit: DistanceUnit;
};

function MaintenanceRecencyCard({
  item,
  distanceUnit,
  onPress,
}: {
  item: MaintenanceRecencyItem;
  distanceUnit: DistanceUnit;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <InsightCard
      onPress={onPress}
      style={styles.card}
      contentStyle={styles.cardContent}
    >
      <View style={styles.cardHeader}>
        <ExpenseItemIcon iconKey={item.iconKey} size={18} />
        <ThemedText type="smallBold" numberOfLines={2} style={styles.cardTitle}>
          {item.name}
        </ThemedText>
        {item.badge ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  item.badge === "due" ? theme.destructive : theme.primary,
              },
            ]}
          >
            <ThemedText
              type="smallBold"
              style={{ color: theme.primaryForeground }}
            >
              {item.badge === "due" ? "Due" : "Soon"}
            </ThemedText>
          </View>
        ) : null}
      </View>
      <ThemedText type="default">
        {formatDistance(item.mileageSinceKm, distanceUnit)} since
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Since {formatAppDate(item.lastServiceDate)}
      </ThemedText>
      {item.progress !== null ? (
        <View style={[styles.progressTrack, { backgroundColor: theme.muted }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.primary,
                width: `${Math.round(item.progress * 100)}%`,
              },
            ]}
          />
        </View>
      ) : null}
    </InsightCard>
  );
}

export function MaintenanceRecencySection({
  result,
  motorcycleId,
  distanceUnit,
}: MaintenanceRecencySectionProps) {
  if (result.kind === "empty") {
    return (
      <View style={styles.section}>
        <SectionTitle title="Maintenance recency" />
        <InsightEmptyCard message="Log catalog maintenance expenses (not fuel, insurance, or custom items) to see which services are due soon." />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <SectionTitle title="Maintenance recency" />
      <View style={styles.cardRow}>
        {result.items.map((item) => (
          <MaintenanceRecencyCard
            key={item.standardItemId}
            item={item}
            distanceUnit={distanceUnit}
            onPress={() =>
              openMaintenanceReminderForm({
                motorcycleId,
                standardItemId: item.standardItemId,
              })
            }
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  cardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  card: {
    flexGrow: 1,
    flexBasis: "45%",
    minWidth: 150,
  },
  cardContent: {
    gap: Spacing.one,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.one,
  },
  cardTitle: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginTop: Spacing.one,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
});
