
"use client";

import type { Task, User } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Edit,
  PlusSquare,
  Trash2,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface TaskItemProps {
  task: Task;
  users: User[];
  onToggle: (id: string, isSubtask?: boolean, parentId?: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onAddSubtask: (parentId: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onToggleExpand: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

export function TaskItem({
  task,
  users,
  onToggle,
  onDelete,
  onEdit,
  onAddSubtask,
  onMoveUp,
  onMoveDown,
  onToggleExpand,
  isFirst,
  isLast,
}: TaskItemProps) {
  const [displayDate, setDisplayDate] = useState("");
  const assignee = users.find((user) => user.id === task.assignee);
  
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  useEffect(() => {
    if (task.dueDate) {
      setDisplayDate(format(new Date(task.dueDate), "E, MMM d"));
    } else {
      setDisplayDate("");
    }
  }, [task.dueDate]);

  return (
    <Card
      className={cn(
        "transition-all duration-300",
        task.completed && "bg-muted/50"
      )}
      data-completed={task.completed}
    >
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
        {hasSubtasks && (
             <Button variant="ghost" size="icon" className="h-7 w-7 mt-0.5" onClick={() => onToggleExpand(task.id)}>
              {task.isExpanded ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
            </Button>
        )}
        <Checkbox
          className={cn("mt-1", !hasSubtasks && "ml-9")}
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
        />
        <div className="flex-1">
          <CardTitle
            className={cn(
              "text-lg font-medium transition-colors",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </CardTitle>
          {task.description && (
            <CardDescription
              className={cn(
                "text-sm mt-1 transition-colors",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.description}
            </CardDescription>
          )}
        </div>
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onMoveUp(task.id)}
            disabled={isFirst}
            aria-label="Move task up"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onMoveDown(task.id)}
            disabled={isLast}
            aria-label="Move task down"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {(task.notes || task.dueDate || assignee) && (
        <CardContent className="p-4 pt-0 pl-[4.25rem]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {assignee && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://i.pravatar.cc/40?u=${assignee.id}`} alt={assignee.name} data-ai-hint="user avatar" />
                    <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{assignee.name}</span>
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{displayDate}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
               <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onAddSubtask(task.id)}
                aria-label="Add sub-task"
              >
                <PlusSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(task)}
                aria-label="Edit task"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete(task.id)}
                aria-label="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {task.notes && (
            <p className="mt-3 text-sm bg-muted p-3 rounded-md border">{task.notes}</p>
          )}
        </CardContent>
      )}

      {task.isExpanded && hasSubtasks && (
          <CardContent className="p-4 pt-0 pl-10">
             <div className="space-y-2">
                {task.subtasks?.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-3 group">
                        <Checkbox
                            id={`subtask-${subtask.id}`}
                            checked={subtask.completed}
                            onCheckedChange={() => onToggle(subtask.id, true, task.id)}
                        />
                        <label 
                            htmlFor={`subtask-${subtask.id}`}
                            className={cn("flex-1 text-sm", subtask.completed && "line-through text-muted-foreground")}
                        >
                            {subtask.title}
                        </label>
                    </div>
                ))}
            </div>
          </CardContent>
      )}
    </Card>
  );
}
