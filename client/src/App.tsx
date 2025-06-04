
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { GroceryItem, CreateGroceryItemInput, GroceryCategory } from '../../server/src/schema';

function App() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateGroceryItemInput>({
    name: '',
    category: 'Produce'
  });

  // Category colors for visual appeal
  const categoryColors: Record<GroceryCategory, string> = {
    'Produce': 'bg-green-100 text-green-800 border-green-200',
    'Dairy': 'bg-blue-100 text-blue-800 border-blue-200',
    'Bakery': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Meat': 'bg-red-100 text-red-800 border-red-200',
    'Pantry': 'bg-orange-100 text-orange-800 border-orange-200',
    'Frozen': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Household': 'bg-purple-100 text-purple-800 border-purple-200'
  };

  // Category emojis for visual appeal
  const categoryEmojis: Record<GroceryCategory, string> = {
    'Produce': '🥬',
    'Dairy': '🥛',
    'Bakery': '🥖',
    'Meat': '🥩',
    'Pantry': '🥫',
    'Frozen': '🧊',
    'Household': '🧽'
  };

  const loadItems = useCallback(async () => {
    try {
      const result = await trpc.getGroceryItems.query();
      setItems(result);
    } catch (error) {
      console.error('Failed to load grocery items:', error);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setIsAdding(true);
    try {
      const newItem = await trpc.createGroceryItem.mutate(formData);
      setItems((prev: GroceryItem[]) => [...prev, newItem]);
      setFormData({ name: '', category: 'Produce' });
    } catch (error) {
      console.error('Failed to create grocery item:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleTogglePurchased = async (id: number, currentState: boolean) => {
    try {
      const updatedItem = await trpc.markItemPurchased.mutate({
        id,
        is_purchased: !currentState
      });
      setItems((prev: GroceryItem[]) =>
        prev.map((item: GroceryItem) =>
          item.id === id ? updatedItem : item
        )
      );
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await trpc.deleteGroceryItem.mutate({ id });
      setItems((prev: GroceryItem[]) => prev.filter((item: GroceryItem) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  // Separate items into pending and purchased
  const pendingItems = items.filter((item: GroceryItem) => !item.is_purchased);
  const purchasedItems = items.filter((item: GroceryItem) => item.is_purchased);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto max-w-md p-4 pb-20">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            💕 Lovable Groceries
          </h1>
          <p className="text-gray-600 text-sm">Your smart shopping companion</p>
        </div>

        {/* Add Item Form */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" />
              Add New Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="What do you need? 🛒"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateGroceryItemInput) => ({ ...prev, name: e.target.value }))
                }
                className="border-2 border-purple-200 focus:border-purple-400 rounded-xl"
                required
              />
              <Select
                value={formData.category || 'Produce'}
                onValueChange={(value: GroceryCategory) =>
                  setFormData((prev: CreateGroceryItemInput) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryEmojis).map(([category, emoji]) => (
                    <SelectItem key={category} value={category}>
                      {emoji} {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="submit" 
                disabled={isAdding || !formData.name.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl"
              >
                {isAdding ? 'Adding...' : '✨ Add to List'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{pendingItems.length}</div>
              <div className="text-sm text-blue-600">To Buy</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{purchasedItems.length}</div>
              <div className="text-sm text-green-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Shopping List - Pending Items */}
        {pendingItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
              Shopping List ({pendingItems.length})
            </h2>
            <div className="space-y-3">
              {pendingItems.map((item: GroceryItem) => (
                <Card key={item.id} className="shadow-sm border-0 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => handleTogglePurchased(item.id, item.is_purchased)}
                          className="h-5 w-5"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{item.name}</div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs mt-1 ${categoryColors[item.category]}`}
                          >
                            {categoryEmojis[item.category]} {item.category}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Items */}
        {purchasedItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Completed ({purchasedItems.length})
            </h2>
            <div className="space-y-3">
              {purchasedItems.map((item: GroceryItem) => (
                <Card key={item.id} className="shadow-sm border-0 bg-green-50/80 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={true}
                          onCheckedChange={() => handleTogglePurchased(item.id, item.is_purchased)}
                          className="h-5 w-5"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-600 line-through">{item.name}</div>
                          <Badge 
                            variant="outline" 
                            className="text-xs mt-1 bg-green-100 text-green-700 border-green-200"
                          >
                            {categoryEmojis[item.category]} {item.category}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <Card className="text-center py-12 bg-white/50 backdrop-blur-sm border-0 shadow-sm">
            <CardContent>
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Your list is empty!</h3>
              <p className="text-gray-500 text-sm">Add your first grocery item above to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;
