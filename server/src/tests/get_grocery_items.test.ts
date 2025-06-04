
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { groceryItemsTable } from '../db/schema';
import { type CreateGroceryItemInput } from '../schema';
import { getGroceryItems } from '../handlers/get_grocery_items';

describe('getGroceryItems', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no items exist', async () => {
    const result = await getGroceryItems();

    expect(result).toEqual([]);
  });

  it('should return all grocery items', async () => {
    // Create test data
    await db.insert(groceryItemsTable)
      .values([
        {
          name: 'Apples',
          category: 'Produce',
          is_purchased: false
        },
        {
          name: 'Milk',
          category: 'Dairy',
          is_purchased: true
        },
        {
          name: 'Bread',
          category: 'Bakery',
          is_purchased: false
        }
      ])
      .execute();

    const result = await getGroceryItems();

    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('Apples');
    expect(result[0].category).toEqual('Produce');
    expect(result[0].is_purchased).toEqual(false);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    expect(result[1].name).toEqual('Milk');
    expect(result[1].category).toEqual('Dairy');
    expect(result[1].is_purchased).toEqual(true);

    expect(result[2].name).toEqual('Bread');
    expect(result[2].category).toEqual('Bakery');
    expect(result[2].is_purchased).toEqual(false);
  });

  it('should return items in order they were created', async () => {
    // Create test data with slight delay to ensure different timestamps
    await db.insert(groceryItemsTable)
      .values({
        name: 'First Item',
        category: 'Produce',
        is_purchased: false
      })
      .execute();

    await db.insert(groceryItemsTable)
      .values({
        name: 'Second Item',
        category: 'Dairy',
        is_purchased: false
      })
      .execute();

    const result = await getGroceryItems();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('First Item');
    expect(result[1].name).toEqual('Second Item');
    expect(result[0].created_at <= result[1].created_at).toBe(true);
  });
});
