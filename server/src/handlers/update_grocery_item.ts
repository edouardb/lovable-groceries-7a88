
import { db } from '../db';
import { groceryItemsTable } from '../db/schema';
import { type UpdateGroceryItemInput, type GroceryItem } from '../schema';
import { eq } from 'drizzle-orm';

export const updateGroceryItem = async (input: UpdateGroceryItemInput): Promise<GroceryItem> => {
  try {
    // Build the update values object dynamically
    const updateValues: any = {
      updated_at: new Date()
    };

    if (input.name !== undefined) {
      updateValues.name = input.name;
    }

    if (input.category !== undefined) {
      updateValues.category = input.category;
    }

    if (input.is_purchased !== undefined) {
      updateValues.is_purchased = input.is_purchased;
    }

    // Update the grocery item
    const result = await db
      .update(groceryItemsTable)
      .set(updateValues)
      .where(eq(groceryItemsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Grocery item with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Grocery item update failed:', error);
    throw error;
  }
};
