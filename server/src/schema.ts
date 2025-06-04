
import { z } from 'zod';

// Grocery categories enum
export const groceryCategorySchema = z.enum([
  'Produce',
  'Dairy',
  'Bakery',
  'Meat',
  'Pantry',
  'Frozen',
  'Household'
]);

export type GroceryCategory = z.infer<typeof groceryCategorySchema>;

// Grocery item schema
export const groceryItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: groceryCategorySchema,
  is_purchased: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type GroceryItem = z.infer<typeof groceryItemSchema>;

// Input schema for creating grocery items
export const createGroceryItemInputSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: groceryCategorySchema
});

export type CreateGroceryItemInput = z.infer<typeof createGroceryItemInputSchema>;

// Input schema for updating grocery items
export const updateGroceryItemInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Item name is required').optional(),
  category: groceryCategorySchema.optional(),
  is_purchased: z.boolean().optional()
});

export type UpdateGroceryItemInput = z.infer<typeof updateGroceryItemInputSchema>;

// Input schema for marking item as purchased
export const markItemPurchasedInputSchema = z.object({
  id: z.number(),
  is_purchased: z.boolean()
});

export type MarkItemPurchasedInput = z.infer<typeof markItemPurchasedInputSchema>;

// Input schema for deleting item
export const deleteGroceryItemInputSchema = z.object({
  id: z.number()
});

export type DeleteGroceryItemInput = z.infer<typeof deleteGroceryItemInputSchema>;
