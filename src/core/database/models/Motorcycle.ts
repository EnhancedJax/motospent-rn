import type { Query } from "@nozbe/watermelondb";
import { Model } from "@nozbe/watermelondb";
import { children, field } from "@nozbe/watermelondb/decorators";

import type Expense from "./Expense";
import type MaintenanceReminder from "./MaintenanceReminder";

export default class Motorcycle extends Model {
  static table = "motorcycles";

  static associations = {
    expenses: { type: "has_many" as const, foreignKey: "motorcycle_id" },
    maintenance_reminders: {
      type: "has_many" as const,
      foreignKey: "motorcycle_id",
    },
  };

  @field("name") name!: string;
  @field("notes") notes?: string;
  @field("purchase_price") purchasePrice?: number;
  @field("purchase_date") purchaseDate?: number;
  @field("odometer_at_addition_km") odometerAtAdditionKm!: number;
  @field("image_url") imageUrl?: string;
  @field("created_at") createdAt!: number;
  @field("updated_at") updatedAt!: number;
  @field("deleted_at") deletedAt?: number;

  @children("expenses") expenses!: Query<Expense>;
  @children("maintenance_reminders")
  maintenanceReminders!: Query<MaintenanceReminder>;
}
