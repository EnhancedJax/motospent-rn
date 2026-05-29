import { Q } from '@nozbe/watermelondb';

export const notDeleted = Q.where('deleted_at', null);
