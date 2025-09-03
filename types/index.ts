
export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Task {
  id:string;
  title: string;
  description?: string;
  notes?: string;
  dueDate?: string;
  assignee?: User['id'];
  completed: boolean;
  priority: number;
  subtasks?: Task[];
  isExpanded?: boolean;
}

export interface GroceryItem {
  id: string;
  name: string;
  completed: boolean;
}
