
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { groceryItemsTable } from '../db/schema';
import { type MarkItemPurchasedInput, type CreateGroceryItemInput } from '../schema';
import { markItemPurchased } from '../handlers/mark_item_purchased';
import { eq } from 'drizzle-orm';

// Test input for creating a grocery item
const testCreateInput: CreateGroceryItemInput = {
  name: 'Test Apples',
  category: 'Produce'
};

describe('markItemPurchased', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should mark item as purchased', async () => {
    // Create a test grocery item first
    const createResult = await db.insert(groceryItemsTable)
      .values({
        name: testCreateInput.name,
        category: testCreateInput.category,
        is_purchased: false
      })
      .returning()
      .execute();

    const createdItem = createResult[0];

    // Test marking as purchased
    const markInput: MarkItemPurchasedInput = {
      id: createdItem.id,
      is_purchased: true
    };

    const result = await markItemPurchased(markInput);

    // Verify the result
    expect(result.id).toEqual(createdItem.id);
    expect(result.name).toEqual('Test Apples');
    expect(result.category).toEqual('Produce');
    expect(result.is_purchased).toBe(true);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > createdItem.updated_at).toBe(true);
  });

  it('should mark item as unpurchased', async () => {
    // Create a test grocery item that is already purchased
    const createResult = await db.insert(groceryItemsTable)
      .values({
        name: testCreateInput.name,
        category: testCreateInput.category,
        is_purchased: true
      })
      .returning()
      .execute();

    const createdItem = createResult[0];

    // Test marking as unpurchased
    const markInput: MarkItemPurchasedInput = {
      id: createdItem.id,
      is_purchased: false
    };

    const result = await markItemPurchased(markInput);

    // Verify the result
    expect(result.id).toEqual(createdItem.id);
    expect(result.name).toEqual('Test Apples');
    expect(result.category).toEqual('Produce');
    expect(result.is_purchased).toBe(false);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update item in database', async () => {
    // Create a test grocery item first
    const createResult = await db.insert(groceryItemsTable)
      .values({
        name: testCreateInput.name,
        category: testCreateInput.category,
        is_purchased: false
      })
      .returning()
      .execute();

    const createdItem = createResult[0];

    // Mark as purchased
    const markInput: MarkItemPurchasedInput = {
      id: createdItem.id,
      is_purchased: true
    };

    await markItemPurchased(markInput);

    // Query database to verify the update
    const items = await db.select()
      .from(groceryItemsTable)
      .where(eq(groceryItemsTable.id, createdItem.id))
      .execute();

    expect(items).toHaveLength(1);
    expect(items[0].is_purchased).toBe(true);
    expect(items[0].updated_at).toBeInstanceOf(Date);
    expect(items[0].updated_at > createdItem.updated_at).toBe(true);
  });

  it('should throw error for non-existent item', async () => {
    const markInput: MarkItemPurchasedInput = {
      id: 999,
      is_purchased: true
    };

    await expect(markItemPurchased(markInput)).rejects.toThrow(/not found/i);
  });
});
