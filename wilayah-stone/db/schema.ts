import {sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const records=sqliteTable('records',{id:text('id').primaryKey(),kind:text('kind').notNull(),owner:text('owner').notNull(),data:text('data').notNull(),created:text('created').notNull(),updated:text('updated').notNull()});
