
import type { User, Task, GroceryItem } from '@/types';

export const INITIAL_USERS: User[] = [
  { id: 'user-1', name: 'Alex', avatar: '/avatars/01.png' },
  { id: 'user-2', name: 'Ben', avatar: '/avatars/02.png' },
  { id: 'user-3', name: 'Chris', avatar: '/avatars/03.png' },
  { id: 'user-4', name: 'Dana', avatar: '/avatars/04.png' },
  { id: 'user-5', name: 'Ray', avatar: '/avatars/05.png' },
  { id: 'user-6', name: 'Janno', avatar: '/avatars/06.png' },
];

export const INITIAL_HOME_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Plan weekly meals',
    description: 'Decide on dinners for the upcoming week and create a shopping list.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    assignee: 'user-1',
    completed: false,
    priority: 1,
    isExpanded: true,
    subtasks: [
      {
        id: 'subtask-1',
        title: 'Choose recipes for Mon-Wed',
        completed: false,
        priority: 1,
      },
      {
        id: 'subtask-2',
        title: 'Choose recipes for Thu-Sun',
        completed: false,
        priority: 2,
      },
      {
        id: 'subtask-3',
        title: 'Write down all ingredients',
        completed: false,
        priority: 3,
      },
    ]
  },
  {
    id: 'task-2',
    title: 'Deep clean the kitchen',
    description: 'Wipe down all surfaces, clean the oven, and mop the floor.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString(),
    assignee: 'user-2',
    completed: false,
    priority: 2,
  },
  {
    id: 'task-3',
    title: 'Organize the garage',
    notes: 'Sort through boxes and create a donation pile.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    completed: true,
    priority: 3,
  },
    {
    id: 'task-4',
    title: 'Book dentist appointments',
    description: 'Schedule check-ups for everyone in the family.',
    dueDate: new Date().toISOString(),
    assignee: 'user-3',
    completed: false,
    priority: 4,
  },
];

export const INITIAL_CONDO_TASKS: Task[] = [
  {
    id: 'task-5',
    title: 'Restock the pantry',
    description: 'Check inventory of non-perishables and buy what is needed.',
    assignee: 'user-4',
    completed: false,
    priority: 1,
  },
  {
    id: 'task-6',
    title: 'Fix leaky faucet in bathroom',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    assignee: 'user-2',
    completed: false,
    priority: 2,
  },
];

export const INITIAL_HOME_GROCERIES: GroceryItem[] = [
  { id: 'g-1', name: 'Milk', completed: false },
  { id: 'g-2', name: 'Bread', completed: true },
  { id: 'g-3', name: 'Eggs', completed: false },
];

export const INITIAL_CONDO_GROCERIES: GroceryItem[] = [
  { id: 'g-4', name: 'Coffee', completed: false },
  { id: 'g-5', name: 'Paper towels', completed: false },
];
