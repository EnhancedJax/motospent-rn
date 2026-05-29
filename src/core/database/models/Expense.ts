import type { Relation } from "@nozbe/watermelondb";
import { Model } from "@nozbe/watermelondb";
import { field, relation } from "@nozbe/watermelondb/decorators";

import type Motorcycle from "./Motorcycle";
import type StandardExpenseItem from "./StandardExpenseItem";

export default class Expense extends Model {
  static table = "expenses";

  static associations = {
    motorcycles: { type: "belongs_to" as const, key: "motorcycle_id" },
    standard_expense_items: {
      type: "belongs_to" as const,
      key: "listed_item_id",
    },
  };

  @field("item") item!: string;
  @field("cost") cost!: number;
  @field("odometer_km") odometerKm!: number;
  @field("date") date!: number;
  @field("fuel_amount_liters") fuelAmountLiters?: number;
  @field("notes") notes?: string;
  @field("created_at") createdAt!: number;
  @field("updated_at") updatedAt!: number;
  @field("deleted_at") deletedAt?: number;

  @relation("motorcycles", "motorcycle_id") motorcycle!: Relation<Motorcycle>;
  @relation("standard_expense_items", "listed_item_id")
  listedItem?: Relation<StandardExpenseItem>;
}
