
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { groceryItemsTable } from '../db/schema';
import { type UpdateGroceryItemInput } from '../schema';
import { updateGroceryItem } from '../handlers/update_grocery_item';
import { eq } from 'drizzle-orm';

describe('updateGroceryItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testItemId: number;

  beforeEach(async () => {
    // Create a test grocery item
    const result = await db
      .insert(groceryItemsTable)
      .values({
        name: 'Original Item',
        category: 'Produce',
        is_purchased: false
      })
      .returning()
      .execute();

    testItemId = result[0].id;
  });

  it('should update item name', async () => {
    const input: UpdateGroceryItemInput = {
      id: testItemId,
      name: 'Updated Item Name'
    };

    const result = await updateGroceryItem(input);

    expect(result.id).toEqual(testItemId);
    expect(result.name).toEqual('Updated Item Name');
    expect(result.category).toEqual('Produce'); // Should remain unchanged
    expect(result.is_purchased).toEqual(false); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update item category', async () => {
    const input: UpdateGroceryItemInput = {
      id: testItemId,
      category: 'Dairy'
    };

    const result = await updateGroceryItem(input);

    expect(result.id).toEqual(testItemId);
    expect(result.name).toEqual('Original Item'); // Should remain unchanged
    expect(result.category).toEqual('Dairy');
    expect(result.is_purchased).toEqual(false); // Should remain unchanged
  });

  it('should update purchase status', async () => {
    const input: UpdateGroceryItemInput = {
      id: testItemId,
      is_purchased: true
    };

    const result = await updateGroceryItem(input);

    expect(result.id).toEqual(testItemId);
    expect(result.name).toEqual('Original Item'); // Should remain unchanged
    expect(result.category).toEqual('Produce'); // Should remain unchanged
    expect(result.is_purchased).toEqual(true);
  });

  it('should update multiple fields at once', async () => {
    const input: UpdateGroceryItemInput = {
      id: testItemId,
      name: 'Multi-Update Item',
      category: 'Bakery',
      is_purchased: true
    };

    const result = await updateGroceryItem(input);

    expect(result.id).toEqual(testItemId);
    expect(result.name).toEqual('Multi-Update Item');
    expect(result.category).toEqual('Bakery');
    expect(result.is_purchased).toEqual(true);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update item in database', async () => {
    const input: UpdateGroceryItemInput = {
      id: testItemId,
      name: 'Database Updated Item',
      category: 'Meat'
    };

    await updateGroceryItem(input);

    // Verify the item was updated in the database
    const items = await db
      .select()
      .from(groceryItemsTable)
      .where(eq(groceryItemsTable.id, testItemId))
      .execute();

    expect(items).toHaveLength(1);
    expect(items[0].name).toEqual('Database Updated Item');
    expect(items[0].category).toEqual('Meat');
    expect(items[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent item', async () => {
    const input: UpdateGroceryItemInput = {
      id: 99999,
      name: 'Non-existent Item'
    };

    await expect(updateGroceryItem(input)).rejects.toThrow(/not found/i);
  });

  it('should update timestamp when any field is changed', async () => {
    // Get original timestamp
    const originalItem = await db
      .select()
      .from(groceryItemsTable)
      .where(eq(groceryItemsTable.id, testItemId))
      .execute();

    const originalTimestamp = originalItem[0].updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateGroceryItemInput = {
      id: testItemId,
      name: 'Timestamp Test'
    };

    const result = await updateGroceryItem(input);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalTimestamp.getTime());
  });
});
