
import { db } from '../db';
import { groceryItemsTable } from '../db/schema';
import { type GroceryItem } from '../schema';

export const getGroceryItems = async (): Promise<GroceryItem[]> => {
  try {
    const results = await db.select()
      .from(groceryItemsTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get grocery items:', error);
    throw error;
  }
};
