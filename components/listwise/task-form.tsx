
"use client";

import type { Task, User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Sparkles, Loader2, BrainCircuit } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { suggestAssignee } from "@/ai/flows/ai-assignee-suggestions";
import { breakdownTask } from "@/ai/flows/task-breakdown";
import { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { Checkbox } from "../ui/checkbox";

const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().optional(),
  notes: z.string().optional(),
  dueDate: z.date().optional(),
  assignee: z.string().optional(),
  subtasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    completed: z.boolean(),
  })).optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskSave: (task: Task, parentId?: string) => void;
  taskToEdit?: Task;
  parentTaskId?: string | null;
  users: User[];
}

export function TaskForm({
  isOpen,
  onOpenChange,
  onTaskSave,
  taskToEdit,
  parentTaskId,
  users,
}: TaskFormProps) {
  const [isAssigneeAiPending, startAssigneeAiTransition] = useTransition();
  const [isBreakdownAiPending, startBreakdownAiTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      notes: "",
      assignee: "",
      subtasks: [],
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        title: taskToEdit?.title || "",
        description: taskToEdit?.description || "",
        notes: taskToEdit?.notes || "",
        dueDate: taskToEdit?.dueDate ? new Date(taskToEdit.dueDate) : undefined,
        assignee: taskToEdit?.assignee || "",
        subtasks: taskToEdit?.subtasks?.map(st => ({...st})) || [],
      });
    }
  }, [isOpen, taskToEdit, form]);

  const onSubmit = (data: TaskFormValues) => {
    const newOrUpdatedTask: Task = {
      id: taskToEdit?.id || `task-${Date.now()}`,
      completed: taskToEdit?.completed || false,
      priority: taskToEdit?.priority || 0,
      title: data.title,
      description: data.description,
      notes: data.notes,
      dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
      assignee: data.assignee,
      subtasks: data.subtasks?.map(st => ({...st, priority: 0})),
      isExpanded: (data.subtasks?.length || 0) > 0 ? true : taskToEdit?.isExpanded
    };
    onTaskSave(newOrUpdatedTask, parentTaskId || undefined);
    onOpenChange(false);
  };

  const handleSuggestAssignee = () => {
    const taskTitle = form.getValues("title");
    if (!taskTitle) {
      toast({
        variant: "destructive",
        title: "No Title Provided",
        description: "Please enter a task title to get a suggestion.",
      });
      return;
    }

    startAssigneeAiTransition(async () => {
      try {
        const result = await suggestAssignee({
          taskType: taskTitle,
          availableAssignees: users.map((u) => u.name),
        });
        const suggestedUser = users.find(u => u.name === result.suggestedAssignee);
        if (suggestedUser) {
          form.setValue("assignee", suggestedUser.id);
          toast({
            title: "AI Suggestion",
            description: `Suggested assignee: ${result.suggestedAssignee} (Confidence: ${Math.round(result.confidence * 100)}%)`,
          });
        }
      } catch (error) {
        console.error("AI Assignee Suggestion Error:", error);
        toast({
          variant: "destructive",
          title: "AI Error",
          description: "Could not get an assignee suggestion.",
        });
      }
    });
  };
  
  const handleBreakdownTask = () => {
    const taskTitle = form.getValues("title");
     if (!taskTitle) {
      toast({
        variant: "destructive",
        title: "No Title Provided",
        description: "Please enter a task title to break it down.",
      });
      return;
    }
    startBreakdownAiTransition(async () => {
       try {
        const result = await breakdownTask({ taskTitle });
        const newSubtasks = result.subtasks.map((title, index) => ({
            id: `subtask-${Date.now()}-${index}`,
            title,
            completed: false,
        }));
        const currentSubtasks = form.getValues("subtasks") || [];
        form.setValue("subtasks", [...currentSubtasks, ...newSubtasks]);
        toast({
          title: "AI Task Breakdown",
          description: `Added ${result.subtasks.length} subtasks.`,
        });
       } catch (error) {
        console.error("AI Task Breakdown Error:", error);
        toast({
          variant: "destructive",
          title: "AI Error",
          description: "Could not break down the task.",
        });
      }
    })
  }
  
  const getTitle = () => {
    if (taskToEdit) return "Edit Task";
    if (parentTaskId) return "Add Sub-task";
    return "Add New Task";
  }

  const subtasks = form.watch("subtasks");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="e.g., Water the plants" {...field} />
                    </FormControl>
                    {!parentTaskId && (
                       <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleBreakdownTask}
                        disabled={isBreakdownAiPending}
                        aria-label="Breakdown Task with AI"
                        title="Breakdown Task with AI"
                      >
                        {isBreakdownAiPending ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {subtasks && subtasks.length > 0 && !parentTaskId && (
                <div className="space-y-2 pl-4">
                  <FormLabel>Subtasks</FormLabel>
                  {subtasks.map((subtask, index) => (
                    <div key={subtask.id} className="flex items-center gap-2">
                       <Checkbox 
                        checked={subtask.completed}
                        onCheckedChange={(checked) => {
                           const newSubtasks = [...subtasks];
                           newSubtasks[index].completed = !!checked;
                           form.setValue("subtasks", newSubtasks);
                        }}
                       />
                       <Input 
                         value={subtask.title}
                         onChange={(e) => {
                            const newSubtasks = [...subtasks];
                            newSubtasks[index].title = e.target.value;
                            form.setValue("subtasks", newSubtasks);
                         }}
                         className="h-8"
                       />
                    </div>
                  ))}
                </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add more details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Private notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <div className="flex gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleSuggestAssignee}
                        disabled={isAssigneeAiPending}
                        aria-label="Suggest Assignee"
                      >
                        {isAssigneeAiPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
                      </Button>
                      </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
