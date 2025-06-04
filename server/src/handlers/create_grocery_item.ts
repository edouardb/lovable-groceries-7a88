
import { db } from '../db';
import { groceryItemsTable } from '../db/schema';
import { type CreateGroceryItemInput, type GroceryItem } from '../schema';

export const createGroceryItem = async (input: CreateGroceryItemInput): Promise<GroceryItem> => {
  try {
    // Insert grocery item record
    const result = await db.insert(groceryItemsTable)
      .values({
        name: input.name,
        category: input.category
        // is_purchased defaults to false
        // created_at and updated_at are set automatically
      })
      .returning()
      .execute();

    // Return the created item
    const groceryItem = result[0];
    return groceryItem;
  } catch (error) {
    console.error('Grocery item creation failed:', error);
    throw error;
  }
};
