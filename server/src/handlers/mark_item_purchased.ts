
import { db } from '../db';
import { groceryItemsTable } from '../db/schema';
import { type MarkItemPurchasedInput, type GroceryItem } from '../schema';
import { eq } from 'drizzle-orm';

export const markItemPurchased = async (input: MarkItemPurchasedInput): Promise<GroceryItem> => {
  try {
    // Update the grocery item's purchased status
    const result = await db.update(groceryItemsTable)
      .set({
        is_purchased: input.is_purchased,
        updated_at: new Date()
      })
      .where(eq(groceryItemsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Grocery item with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Mark item purchased failed:', error);
    throw error;
  }
};
