
"use client";

import type { Task, User } from "@/types";
import { useState, useTransition, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, List, Calendar as CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import { TaskItem } from "./task-item";
import { TaskForm } from "./task-form";
import { CalendarView } from "./calendar-view";
import { getDueDateReminder } from "@/ai/flows/intelligent-due-date-reminders";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { differenceInDays, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface TaskListProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  users: User[];
}

type ViewMode = "list" | "calendar";

// Recursive function to find and apply an action to a task by ID
function findAndApply(tasks: Task[], id: string, action: (task: Task, parent?: Task) => void): Task[] {
  const newTasks = JSON.parse(JSON.stringify(tasks)); // Deep copy
  
  const findAndUpdate = (currentTasks: Task[], parent?: Task) => {
    for (let i = 0; i < currentTasks.length; i++) {
      const task = currentTasks[i];
      if (task.id === id) {
        action(task, parent);
        return true;
      }
      if (task.subtasks) {
        if (findAndUpdate(task.subtasks, task)) {
          return true;
        }
      }
    }
    return false;
  };
  
  findAndUpdate(newTasks);
  return newTasks;
}

// Recursive function to remove a task by ID
function removeTask(tasks: Task[], id: string): Task[] {
  return tasks.reduce((acc, task) => {
    if (task.id === id) return acc;
    if (task.subtasks) {
      task.subtasks = removeTask(task.subtasks, id);
    }
    acc.push(task);
    return acc;
  }, [] as Task[]);
}

// Recursive function to add or update a task
function upsertTask(tasks: Task[], taskToSave: Task, parentId?: string): Task[] {
    if (parentId) {
        return tasks.map(task => {
            if (task.id === parentId) {
                if (!task.subtasks) task.subtasks = [];
                const existingSubtaskIndex = task.subtasks.findIndex(st => st.id === taskToSave.id);
                if (existingSubtaskIndex > -1) {
                    task.subtasks[existingSubtaskIndex] = taskToSave;
                } else {
                    task.subtasks.push(taskToSave);
                }
                task.isExpanded = true; 
            } else if (task.subtasks) {
                task.subtasks = upsertTask(task.subtasks, taskToSave, parentId);
            }
            return task;
        });
    }

    const existingIndex = tasks.findIndex(t => t.id === taskToSave.id);
    if (existingIndex > -1) {
        const newTasks = [...tasks];
        // Preserve existing subtasks and expansion state if not provided in the saved task
        taskToSave.subtasks = taskToSave.subtasks || newTasks[existingIndex].subtasks;
        taskToSave.isExpanded = taskToSave.isExpanded ?? newTasks[existingIndex].isExpanded;
        newTasks[existingIndex] = taskToSave;
        return newTasks;
    } else {
        return [...tasks, taskToSave];
    }
}


export function TaskList({ tasks, onTasksChange, users }: TaskListProps) {
  const [isFormOpen, setFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [, startTransition] = useTransition();
  const [reminders, setReminders] = useState<string[]>([]);
  const [isRemindersLoading, setRemindersLoading] = useState(false);
  const [aiQuotaExceeded, setAiQuotaExceeded] = useState(false);

  const fetchReminders = useCallback(async () => {
    if (aiQuotaExceeded) return;

    setRemindersLoading(true);
    const today = new Date();
    const upcomingTasks = tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      const dueDate = parseISO(task.dueDate);
      const daysUntilDue = differenceInDays(dueDate, today);
      return daysUntilDue >= 0 && daysUntilDue <= 7;
    });

    if (upcomingTasks.length === 0) {
        setRemindersLoading(false);
        return;
    }

    const reminderPromises = upcomingTasks
      .filter(task => task.assignee)
      .map(async task => {
        const assigneeName = users.find(u => u.id === task.assignee)?.name;
        if (!assigneeName || !task.dueDate) return null;
        
        try {
          const result = await getDueDateReminder({
            taskDescription: task.title,
            assignee: assigneeName,
            dueDate: task.dueDate,
            historicalCompletionTimes: [3, 5, 2, 7], 
          });
          return result.reminderMessage;
        } catch (error: any) {
          console.error("Error fetching due date reminder:", error);
          if (error.message && error.message.includes('429')) {
             if (!aiQuotaExceeded) { 
              setAiQuotaExceeded(true);
            }
          }
          return null; 
        }
      });
      
    const settledReminders = await Promise.all(reminderPromises);
    setReminders(settledReminders.filter((r): r is string => r !== null && r !== ""));
    setRemindersLoading(false);
  }, [tasks, users, aiQuotaExceeded]);


  useEffect(() => {
    if (tasks.length > 0 && users.length > 0) {
      fetchReminders();
    } else {
      setReminders([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, users]);

  const handleToggle = (id: string, isSubtask = false, parentId?: string) => {
    startTransition(() => {
        const newTasks = findAndApply(tasks, id, (task, parent) => {
            task.completed = !task.completed;
            // If toggling a subtask, check if all other subtasks of the parent are completed
            if (isSubtask && parent) {
                const allSubtasksCompleted = parent.subtasks?.every(st => st.completed) ?? false;
                parent.completed = allSubtasksCompleted;
            } else if (task.subtasks?.length) {
                // If toggling a parent task, toggle all its subtasks
                task.subtasks.forEach(st => st.completed = task.completed);
            }
        });
        onTasksChange(newTasks);
    });
};

  const handleDelete = (id: string) => {
    startTransition(() => {
      onTasksChange(removeTask(tasks, id));
    });
  };

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setParentTaskId(null);
    setFormOpen(true);
  };

  const handleAddSubtask = (parentId: string) => {
    setTaskToEdit(undefined);
    setParentTaskId(parentId);
    setFormOpen(true);
  }
  
  const handleOpenNewTaskForm = () => {
    setTaskToEdit(undefined);
    setParentTaskId(null);
    setFormOpen(true);
  }

  const handleTaskSave = (savedTask: Task, parentId?: string) => {
    startTransition(() => {
      let newTasks = upsertTask(tasks, savedTask, parentId);
      onTasksChange(newTasks.sort((a,b) => a.priority - b.priority));
    });
  };

  const handleToggleExpand = (id: string) => {
    startTransition(() => {
      const newTasks = findAndApply(tasks, id, (task) => {
        task.isExpanded = !task.isExpanded;
      });
      onTasksChange(newTasks);
    });
  }
  
  const handleMove = (id: string, direction: 'up' | 'down') => {
    startTransition(() => {
      const taskIndex = tasks.findIndex(task => task.id === id);
      if (taskIndex === -1) return;

      const newTasks = Array.from(tasks);
      const otherIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;

      if(otherIndex < 0 || otherIndex >= newTasks.length) return;

      const tempPriority = newTasks[taskIndex].priority;
      newTasks[taskIndex].priority = newTasks[otherIndex].priority;
      newTasks[otherIndex].priority = tempPriority;
      
      onTasksChange(newTasks.sort((a, b) => a.priority - b.priority));
    });
  };

  const renderTasks = (tasksToRender: Task[]) => {
    return tasksToRender.map((task, index) => (
      <div key={task.id}>
        <TaskItem
          task={task}
          users={users}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onAddSubtask={handleAddSubtask}
          onMoveUp={(id) => handleMove(id, 'up')}
          onMoveDown={(id) => handleMove(id, 'down')}
          onToggleExpand={handleToggleExpand}
          isFirst={index === 0}
          isLast={index === tasksToRender.length - 1}
        />
      </div>
    ));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-headline text-2xl md:text-3xl tracking-tight">To-Do List</h2>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} aria-label="List view">
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'calendar' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('calendar')} aria-label="Calendar view">
            <CalendarIcon className="h-4 w-4" />
          </Button>
          <Button onClick={handleOpenNewTaskForm}>
            <Plus className="-ml-1 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

       {isRemindersLoading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="animate-spin h-4 w-4" />
          <span>Checking for smart reminders...</span>
        </div>
      )}

      {aiQuotaExceeded && (
         <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>AI Quota Reached</AlertTitle>
          <AlertDescription>
            Smart reminders are temporarily unavailable because the daily free limit has been reached. They will resume when the quota resets.
          </AlertDescription>
        </Alert>
      )}

      {!isRemindersLoading && !aiQuotaExceeded && reminders.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Smart Reminders</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {reminders.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {viewMode === "list" && (
        <div className="space-y-3">
          {renderTasks(tasks)}
          {tasks.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
              No tasks yet. Add one to get started!
            </div>
          )}
        </div>
      )}

      {viewMode === "calendar" && <CalendarView tasks={tasks} />}

      <TaskForm
        isOpen={isFormOpen}
        onOpenChange={setFormOpen}
        onTaskSave={handleTaskSave}
        taskToEdit={taskToEdit}
        parentTaskId={parentTaskId}
        users={users}
      />
    </div>
  );
}
