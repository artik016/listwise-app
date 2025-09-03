
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TaskList } from "./task-list";
import { GroceryList } from "./grocery-list";
import type { Task, GroceryItem, User } from "@/types";
import { AssigneeManager } from "./assignee-manager";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { getUserData, updateUsers, updateUserTasks, updateUserGroceries, UserData } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function ListwisePageClient() {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [isDataLoading, setDataLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Unified state for all user data
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    if (user) {
      setDataLoading(true);
      getUserData(user.uid)
        .then(data => {
            // Ensure tasks are sorted by priority
            if (data.homeTasks) {
              data.homeTasks.sort((a,b) => a.priority - b.priority);
            }
            if(data.condoTasks) {
              data.condoTasks.sort((a,b) => a.priority - b.priority);
            }
            setUserData(data);
        })
        .catch(error => {
          console.error("Failed to fetch user data:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load your lists. Please try again later."
          });
        })
        .finally(() => setDataLoading(false));
    }
  }, [user, toast]);
  
  const handleUsersChange = (newUsers: User[]) => {
    if (!user || !userData) return;
    const newUserData = {...userData, users: newUsers };
    setUserData(newUserData);
    startTransition(() => {
      updateUsers(user.uid, newUsers).catch(e => {
        console.error(e);
        toast({variant: 'destructive', title: 'Error saving assignees'})
      });
    });
  };

  const handleTasksChange = (list: 'home' | 'condo') => (newTasks: Task[]) => {
    if (!user || !userData) return;
    const field = list === 'home' ? 'homeTasks' : 'condoTasks';
    const newUserData = {...userData, [field]: newTasks};
    setUserData(newUserData);
    startTransition(() => {
      updateUserTasks(user.uid, list, newTasks).catch(e => {
        console.error(e);
        toast({variant: 'destructive', title: `Error saving ${list} tasks`})
      });
    });
  }

  const handleGroceriesChange = (list: 'home' | 'condo') => (newItems: GroceryItem[]) => {
    if (!user || !userData) return;
    const field = list === 'home' ? 'homeGroceries' : 'condoGroceries';
    const newUserData = {...userData, [field]: newItems};
    setUserData(newUserData);
    startTransition(() => {
      updateUserGroceries(user.uid, list, newItems).catch(e => {
        console.error(e);
        toast({variant: 'destructive', title: `Error saving ${list} groceries`})
      });
    });
  }


  if (isDataLoading) {
    return <div className="w-full h-screen flex items-center justify-center">Loading your lists...</div>;
  }
  
  if (!userData) {
      return <div className="w-full h-screen flex items-center justify-center">Could not load user data.</div>;
  }


  return (
    <main className={cn("container mx-auto p-4 md:p-8", activeTab === 'condo' && 'theme-beach')}>
      <header className="text-center mb-8 relative">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
          ListWise
        </h1>
        <p className="text-muted-foreground mt-2">
          Your intelligent to-do and grocery lists, perfectly organized.
        </p>
         {user && (
          <div className="absolute top-0 right-0 flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline">Welcome, {user.displayName || user.email}</span>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}
      </header>

      <Tabs defaultValue="home" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="condo">Condo</TabsTrigger>
          <TabsTrigger value="assignees">Assignees</TabsTrigger>
        </TabsList>
        <TabsContent value="home" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <TaskList tasks={userData.homeTasks} onTasksChange={handleTasksChange('home')} users={userData.users} />
            </div>
            <div>
              <GroceryList items={userData.homeGroceries} onItemsChange={handleGroceriesChange('home')} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="condo" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <TaskList tasks={userData.condoTasks} onTasksChange={handleTasksChange('condo')} users={userData.users} />
            </div>
            <div>
              <GroceryList items={userData.condoGroceries} onItemsChange={handleGroceriesChange('condo')} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="assignees" className="mt-6">
            <AssigneeManager users={userData.users} onUsersChange={handleUsersChange} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
