
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { groceryItemsTable } from '../db/schema';
import { type DeleteGroceryItemInput } from '../schema';
import { deleteGroceryItem } from '../handlers/delete_grocery_item';
import { eq } from 'drizzle-orm';

describe('deleteGroceryItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing grocery item', async () => {
    // Create a test item directly in database
    const insertResult = await db.insert(groceryItemsTable)
      .values({
        name: 'Test Item',
        category: 'Produce'
      })
      .returning()
      .execute();
    
    const createdItem = insertResult[0];

    // Delete the item
    const deleteInput: DeleteGroceryItemInput = {
      id: createdItem.id
    };
    const result = await deleteGroceryItem(deleteInput);

    expect(result.success).toBe(true);

    // Verify item was deleted from database
    const items = await db.select()
      .from(groceryItemsTable)
      .where(eq(groceryItemsTable.id, createdItem.id))
      .execute();

    expect(items).toHaveLength(0);
  });

  it('should return success when deleting non-existent item', async () => {
    const deleteInput: DeleteGroceryItemInput = {
      id: 999999 // Non-existent ID
    };

    const result = await deleteGroceryItem(deleteInput);

    expect(result.success).toBe(true);
  });

  it('should not affect other items when deleting one item', async () => {
    // Create multiple test items directly in database
    const insertResult1 = await db.insert(groceryItemsTable)
      .values({
        name: 'Item 1',
        category: 'Produce'
      })
      .returning()
      .execute();

    const insertResult2 = await db.insert(groceryItemsTable)
      .values({
        name: 'Item 2',
        category: 'Dairy'
      })
      .returning()
      .execute();

    const item1 = insertResult1[0];
    const item2 = insertResult2[0];

    // Delete first item
    const deleteInput: DeleteGroceryItemInput = {
      id: item1.id
    };
    await deleteGroceryItem(deleteInput);

    // Verify second item still exists
    const remainingItems = await db.select()
      .from(groceryItemsTable)
      .where(eq(groceryItemsTable.id, item2.id))
      .execute();

    expect(remainingItems).toHaveLength(1);
    expect(remainingItems[0].name).toEqual('Item 2');
    expect(remainingItems[0].category).toEqual('Dairy');
  });
});
