import type { Query } from "@nozbe/watermelondb";
import { Model } from "@nozbe/watermelondb";
import { children, field } from "@nozbe/watermelondb/decorators";

import type Expense from "./Expense";
import type MaintenanceReminder from "./MaintenanceReminder";

export default class StandardExpenseItem extends Model {
  static table = "standard_expense_items";

  static associations = {
    expenses: { type: "has_many" as const, foreignKey: "listed_item_id" },
    maintenance_reminders: {
      type: "has_many" as const,
      foreignKey: "standard_item_id",
    },
  };

  @field("name") name!: string;
  @field("icon_key") iconKey!: string;
  @field("suggest_distance_km") suggestDistanceKm!: number;
  @field("counts_toward_maintenance_recency")
  countsTowardMaintenanceRecency!: boolean;
  @field("created_at") createdAt!: number;
  @field("updated_at") updatedAt!: number;
  @field("deleted_at") deletedAt?: number;

  @children("expenses") expenses!: Query<Expense>;
  @children("maintenance_reminders")
  maintenanceReminders!: Query<MaintenanceReminder>;
}
