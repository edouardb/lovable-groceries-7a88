
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { groceryItemsTable } from '../db/schema';
import { type CreateGroceryItemInput } from '../schema';
import { createGroceryItem } from '../handlers/create_grocery_item';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateGroceryItemInput = {
  name: 'Bananas',
  category: 'Produce'
};

describe('createGroceryItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a grocery item', async () => {
    const result = await createGroceryItem(testInput);

    // Basic field validation
    expect(result.name).toEqual('Bananas');
    expect(result.category).toEqual('Produce');
    expect(result.is_purchased).toEqual(false); // Default value
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save grocery item to database', async () => {
    const result = await createGroceryItem(testInput);

    // Query using proper drizzle syntax
    const groceryItems = await db.select()
      .from(groceryItemsTable)
      .where(eq(groceryItemsTable.id, result.id))
      .execute();

    expect(groceryItems).toHaveLength(1);
    expect(groceryItems[0].name).toEqual('Bananas');
    expect(groceryItems[0].category).toEqual('Produce');
    expect(groceryItems[0].is_purchased).toEqual(false);
    expect(groceryItems[0].created_at).toBeInstanceOf(Date);
    expect(groceryItems[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create items with different categories', async () => {
    const produceItem = await createGroceryItem({
      name: 'Apples',
      category: 'Produce'
    });

    const dairyItem = await createGroceryItem({
      name: 'Milk',
      category: 'Dairy'
    });

    const pantryItem = await createGroceryItem({
      name: 'Rice',
      category: 'Pantry'
    });

    expect(produceItem.category).toEqual('Produce');
    expect(dairyItem.category).toEqual('Dairy');
    expect(pantryItem.category).toEqual('Pantry');

    // Verify all items are in database
    const allItems = await db.select()
      .from(groceryItemsTable)
      .execute();

    expect(allItems).toHaveLength(3);
    expect(allItems.map(item => item.category)).toContain('Produce');
    expect(allItems.map(item => item.category)).toContain('Dairy');
    expect(allItems.map(item => item.category)).toContain('Pantry');
  });

  it('should set correct default values', async () => {
    const result = await createGroceryItem(testInput);

    // Verify default values are set correctly
    expect(result.is_purchased).toBe(false);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    
    // Verify timestamps are recent (within last minute)
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    
    expect(result.created_at.getTime()).toBeGreaterThan(oneMinuteAgo.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThan(oneMinuteAgo.getTime());
  });
});
