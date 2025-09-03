
"use client";

import type { Task } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { DayPicker, type DayProps } from "react-day-picker";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isSameDay } from "date-fns";
import { Card, CardContent } from "../ui/card";

interface CalendarViewProps {
  tasks: Task[];
}

export function CalendarView({ tasks }: CalendarViewProps) {
  function Day({ date, ...props }: DayProps) {
    const tasksForDay = tasks.filter(
      (task) => task.dueDate && isSameDay(task.dueDate, date)
    );

    if (tasksForDay.length > 0) {
      const allCompleted = tasksForDay.every((task) => task.completed);
      const Icon = allCompleted ? CheckCircle2 : AlertCircle;
      const iconColor = allCompleted
        ? "text-green-500"
        : "text-red-500";
      
      const day = date.getDate();

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative h-9 w-9 flex items-center justify-center">
                <div>{day}</div>
                <div className="absolute bottom-1 right-1 flex items-center">
                  <ClipboardList className="h-3 w-3 text-muted-foreground" />
                  <Icon className={`h-3 w-3 ${iconColor}`} />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <ul className="space-y-1">
                {tasksForDay.map((task) => (
                  <li key={task.id} className={task.completed ? 'line-through text-muted-foreground' : ''}>{task.title}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div className="h-9 w-9 flex items-center justify-center">
        {date.getDate()}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-2 md:p-4 flex justify-center">
        <Calendar
          mode="single"
          selected={new Date()}
          className="p-0 [&_td]:p-0"
          components={{ Day }}
        />
      </CardContent>
    </Card>
  );
}
