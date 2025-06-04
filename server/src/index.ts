
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  createGroceryItemInputSchema,
  updateGroceryItemInputSchema,
  markItemPurchasedInputSchema,
  deleteGroceryItemInputSchema
} from './schema';

import { createGroceryItem } from './handlers/create_grocery_item';
import { getGroceryItems } from './handlers/get_grocery_items';
import { updateGroceryItem } from './handlers/update_grocery_item';
import { markItemPurchased } from './handlers/mark_item_purchased';
import { deleteGroceryItem } from './handlers/delete_grocery_item';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  createGroceryItem: publicProcedure
    .input(createGroceryItemInputSchema)
    .mutation(({ input }) => createGroceryItem(input)),
    
  getGroceryItems: publicProcedure
    .query(() => getGroceryItems()),
    
  updateGroceryItem: publicProcedure
    .input(updateGroceryItemInputSchema)
    .mutation(({ input }) => updateGroceryItem(input)),
    
  markItemPurchased: publicProcedure
    .input(markItemPurchasedInputSchema)
    .mutation(({ input }) => markItemPurchased(input)),
    
  deleteGroceryItem: publicProcedure
    .input(deleteGroceryItemInputSchema)
    .mutation(({ input }) => deleteGroceryItem(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
