import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "settings",
      columns: [
        { name: "key", type: "string", isIndexed: true },
        { name: "value", type: "string" },
      ],
    }),
    tableSchema({
      name: "motorcycles",
      columns: [
        { name: "name", type: "string" },
        { name: "notes", type: "string", isOptional: true },
        { name: "purchase_price", type: "number", isOptional: true },
        { name: "purchase_date", type: "number", isOptional: true },
        { name: "odometer_at_addition_km", type: "number" },
        { name: "is_primary", type: "boolean", isIndexed: true },
        { name: "image_url", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted_at", type: "number", isOptional: true },
      ],
    }),
    tableSchema({
      name: "standard_expense_items",
      columns: [
        { name: "name", type: "string" },
        { name: "icon_key", type: "string" },
        { name: "suggest_distance_km", type: "number" },
        { name: "counts_toward_maintenance_recency", type: "boolean" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted_at", type: "number", isOptional: true },
      ],
    }),
    tableSchema({
      name: "expenses",
      columns: [
        { name: "motorcycle_id", type: "string", isIndexed: true },
        {
          name: "listed_item_id",
          type: "string",
          isOptional: true,
          isIndexed: true,
        },
        { name: "item", type: "string" },
        { name: "cost", type: "number" },
        { name: "odometer_km", type: "number" },
        { name: "date", type: "number" },
        { name: "fuel_amount_liters", type: "number", isOptional: true },
        { name: "notes", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted_at", type: "number", isOptional: true },
      ],
    }),
    tableSchema({
      name: "maintenance_reminders",
      columns: [
        { name: "motorcycle_id", type: "string", isIndexed: true },
        { name: "standard_item_id", type: "string", isIndexed: true },
        { name: "interval_distance_km", type: "number" },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "deleted_at", type: "number", isOptional: true },
      ],
    }),
  ],
});
