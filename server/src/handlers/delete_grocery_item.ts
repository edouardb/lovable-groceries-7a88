
import { db } from '../db';
import { groceryItemsTable } from '../db/schema';
import { type DeleteGroceryItemInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteGroceryItem = async (input: DeleteGroceryItemInput): Promise<{ success: boolean }> => {
  try {
    const result = await db.delete(groceryItemsTable)
      .where(eq(groceryItemsTable.id, input.id))
      .execute();

    // Return success true regardless of whether item existed
    // This provides idempotent behavior for delete operations
    return { success: true };
  } catch (error) {
    console.error('Grocery item deletion failed:', error);
    throw error;
  }
};
