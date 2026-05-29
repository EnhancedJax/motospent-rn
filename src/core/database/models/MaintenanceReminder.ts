import type { Relation } from "@nozbe/watermelondb";
import { Model } from "@nozbe/watermelondb";
import { field, relation } from "@nozbe/watermelondb/decorators";

import type Motorcycle from "./Motorcycle";
import type StandardExpenseItem from "./StandardExpenseItem";

export default class MaintenanceReminder extends Model {
  static table = "maintenance_reminders";

  static associations = {
    motorcycles: { type: "belongs_to" as const, key: "motorcycle_id" },
    standard_expense_items: {
      type: "belongs_to" as const,
      key: "standard_item_id",
    },
  };

  @field("interval_distance_km") intervalDistanceKm!: number;
  @field("created_at") createdAt!: number;
  @field("updated_at") updatedAt!: number;
  @field("deleted_at") deletedAt?: number;

  @relation("motorcycles", "motorcycle_id") motorcycle!: Relation<Motorcycle>;
  @relation("standard_expense_items", "standard_item_id")
  standardItem!: Relation<StandardExpenseItem>;
}
