
export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  priority: Priority;
  completed: boolean;
  subTasks: SubTask[];
}
