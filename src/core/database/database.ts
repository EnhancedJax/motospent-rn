import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { migrations } from './migrations';
import Expense from './models/Expense';
import MaintenanceReminder from './models/MaintenanceReminder';
import Motorcycle from './models/Motorcycle';
import Setting from './models/Setting';
import StandardExpenseItem from './models/StandardExpenseItem';
import { schema } from './schema';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true,
  onSetUpError: (error) => {
    console.error('Database failed to load', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    Setting,
    Motorcycle,
    StandardExpenseItem,
    Expense,
    MaintenanceReminder,
  ],
});
