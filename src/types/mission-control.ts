// Task Status Types
export type TaskStatus = "backlog" | "pending" | "in_progress" | "review" | "blocked" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  projectId?: string;
  tags?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  timestamp: string;
}

export interface TaskBoard {
  backlog: Task[];
  pending: Task[];
  in_progress: Task[];
  review: Task[];
  blocked: Task[];
  completed: Task[];
}

export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

// Legacy types (for backward compatibility)
export interface ContentItem {
  id: string;
  title: string;
  stage: "ideas" | "script-writing" | "thumbnail" | "filming" | "published";
  description: string;
  script?: string;
  assignedTo: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "scheduled" | "cron";
  agent: string;
}

export interface Memory {
  id: string;
  title: string;
  content: string;
  tags: string[];
  timestamp: string;
  source: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  responsibilities: string[];
  status: "working" | "idle" | "assigned";
  currentTask?: string;
  memoryScope: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  taskId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Sync types
export interface SyncState {
  integration: string;
  lastSyncAt: string | null;
  status: "idle" | "syncing" | "error";
  error?: string;
}