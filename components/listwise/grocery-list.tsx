"use client";

import type { GroceryItem } from "@/types";
import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface GroceryListProps {
  items: GroceryItem[];
  onItemsChange: (items: GroceryItem[]) => void;
}

export function GroceryList({ items, onItemsChange }: GroceryListProps) {
  const [newItemName, setNewItemName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAddItem = () => {
    if (newItemName.trim() === "") return;
    const newItem: GroceryItem = {
      id: `g-${Date.now()}`,
      name: newItemName.trim(),
      completed: false,
    };
    startTransition(() => {
      onItemsChange([...items, newItem]);
      setNewItemName("");
    });
  };

  const handleToggleItem = (id: string) => {
    startTransition(() => {
      onItemsChange(
        items.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );
    });
  };

  const handleRemoveItem = (id: string) => {
    startTransition(() => {
      onItemsChange(items.filter((item) => item.id !== id));
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Grocery List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add a grocery item..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            disabled={isPending}
          />
          <Button onClick={handleAddItem} disabled={isPending} size="icon" aria-label="Add item">
            <Plus />
          </Button>
        </div>
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 group transition-opacity"
              data-completed={item.completed}
            >
              <Checkbox
                id={`grocery-${item.id}`}
                checked={item.completed}
                onCheckedChange={() => handleToggleItem(item.id)}
                aria-label={item.name}
              />
              <label
                htmlFor={`grocery-${item.id}`}
                className="flex-1 text-sm font-medium transition-colors group-data-[completed=true]:line-through group-data-[completed=true]:text-muted-foreground"
              >
                {item.name}
              </label>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveItem(item.id)}
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
