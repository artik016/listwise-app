
"use client";

import type { User } from "@/types";
import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface AssigneeManagerProps {
  users: User[];
  onUsersChange: (users: User[]) => void;
}

export function AssigneeManager({ users, onUsersChange }: AssigneeManagerProps) {
  const [newUserName, setNewUserName] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserName, setEditingUserName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAddUser = () => {
    if (newUserName.trim() === "") return;
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      avatar: "" // No avatar for new users for now
    };
    startTransition(() => {
      onUsersChange([...users, newUser]);
      setNewUserName("");
    });
  };

  const handleRemoveUser = (id: string) => {
    startTransition(() => {
      onUsersChange(users.filter((user) => user.id !== id));
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditingUserName(user.name);
  };
  
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingUserName("");
  };

  const handleSaveUser = (id: string) => {
    if (editingUserName.trim() === "") return;
    startTransition(() => {
      onUsersChange(users.map(u => u.id === id ? {...u, name: editingUserName.trim()} : u));
      setEditingUserId(null);
      setEditingUserName("");
    });
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Manage Assignees</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Add a new assignee..."
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
            disabled={isPending}
          />
          <Button onClick={handleAddUser} disabled={isPending} size="icon" aria-label="Add assignee">
            <Plus />
          </Button>
        </div>
        <ul className="space-y-3">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-3 group"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://i.pravatar.cc/40?u=${user.id}`} alt={user.name} data-ai-hint="user avatar" />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {editingUserId === user.id ? (
                <Input 
                  value={editingUserName}
                  onChange={(e) => setEditingUserName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveUser(user.id)}
                  className="flex-1 text-sm font-medium"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm font-medium">
                  {user.name}
                </span>
              )}
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingUserId === user.id ? (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSaveUser(user.id)}><Save className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancelEdit}><X className="h-4 w-4" /></Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
