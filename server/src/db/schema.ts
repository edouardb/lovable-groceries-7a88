
import { serial, text, boolean, pgTable, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Define the grocery category enum
export const groceryCategoryEnum = pgEnum('grocery_category', [
  'Produce',
  'Dairy', 
  'Bakery',
  'Meat',
  'Pantry',
  'Frozen',
  'Household'
]);

export const groceryItemsTable = pgTable('grocery_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: groceryCategoryEnum('category').notNull(),
  is_purchased: boolean('is_purchased').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schema
export type GroceryItem = typeof groceryItemsTable.$inferSelect;
export type NewGroceryItem = typeof groceryItemsTable.$inferInsert;

// Export all tables for proper query building
export const tables = { groceryItems: groceryItemsTable };
