// Convex API Client for Command Center
// Connects to the mission-control Convex backend

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || "https://witty-raptor-257.convex.cloud";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "review" | "blocked" | "completed" | "cancelled";
  priority: "p0_critical" | "p1_high" | "p2_medium" | "p3_low";
  assignedTo: "user" | "ai" | "senior_dev" | "copywriter" | "external";
  project: "lux_haven" | "ai_automation" | "mission_control" | "infrastructure" | "general";
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  dueDate?: number;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
}

export interface TaskStats {
  total: number;
  byStatus: {
    pending: number;
    in_progress: number;
    review: number;
    blocked: number;
    completed: number;
  };
  byAssignee: {
    user: number;
    ai: number;
    senior_dev: number;
    copywriter: number;
    external: number;
  };
  completedToday: number;
}

export interface TaskBoard {
  pending: Task[];
  in_progress: Task[];
  review: Task[];
  blocked: Task[];
  completed: Task[];
}

// Generic Convex query function
async function convexQuery<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const url = name.includes(':') 
    ? `${CONVEX_URL}/api/query/${name.replace(':', '/')}`
    : `${CONVEX_URL}/api/query/${name}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ args: args ?? {} }),
  });
  
  if (!response.ok) {
    throw new Error(`Convex query failed: ${response.statusText}`);
  }
  
  return response.json();
}

// Generic Convex mutation function
async function convexMutation<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const url = name.includes(':')
    ? `${CONVEX_URL}/api/mutation/${name.replace(':', '/')}`
    : `${CONVEX_URL}/api/mutation/${name}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ args }),
  });
  
  if (!response.ok) {
    throw new Error(`Convex mutation failed: ${response.statusText}`);
  }
  
  return response.json();
}

// API Functions
export const tasksApi = {
  // Queries
  list: (filters?: { status?: string; assignedTo?: string; project?: string }) =>
    convexQuery<Task[]>("tasks/list", filters),
  
  getBoard: () =>
    convexQuery<TaskBoard>("tasks/getBoard"),
  
  get: (id: string) =>
    convexQuery<Task | null>("tasks/get", { id }),
  
  getStats: () =>
    convexQuery<TaskStats>("tasks/getStats"),
  
  getActivity: (taskId: string) =>
    convexQuery("tasks/getActivity", { taskId }),
  
  // Mutations
  create: (task: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
    project?: string;
    dueDate?: number;
    tags?: string[];
    estimatedHours?: number;
  }) => convexMutation<string>("tasks/create", task),
  
  updateStatus: (id: string, status: string) =>
    convexMutation<string>("tasks/updateStatus", { id, status }),
  
  assign: (id: string, assignedTo: string) =>
    convexMutation<string>("tasks/assign", { id, assignedTo }),
  
  update: (id: string, updates: Partial<Task>) =>
    convexMutation<string>("tasks/update", { id, ...updates }),
  
  remove: (id: string) =>
    convexMutation<string>("tasks/remove", { id }),
};

export interface SyncState {
  lastSyncAt: number | null;
  status: "idle" | "syncing" | "error";
  tasksSynced: number;
  tasksFailed: number;
  errorMessage: string | null;
}

export interface SyncTriggerResult {
  id: string;
  status: "syncing";
  message: string;
  startedAt: number;
}

// Sync API
export const syncApi = {
  getState: () =>
    convexQuery<SyncState>("sync/getState"),
  
  trigger: () =>
    convexMutation<SyncTriggerResult>("sync/trigger", {}),
};

// Notification Types
export interface Notification {
  _id: string;
  _creationTime: number;
  userId: string;
  type: "task_assigned" | "task_completed" | "task_comment" | "status_changed" | "due_soon" | "system";
  title: string;
  message: string;
  taskId?: string;
  project?: string;
  read: boolean;
  createdAt: number;
  readAt?: number;
  metadata?: string;
}

export interface NotificationCount {
  total: number;
  byType: Record<string, number>;
}

// Notifications API
export const notificationsApi = {
  // Queries
  list: (userId: string, options?: { unreadOnly?: boolean; limit?: number }) =>
    convexQuery<Notification[]>("notifications/list", { 
      userId, 
      unreadOnly: options?.unreadOnly ?? false,
      limit: options?.limit ?? 50 
    }),
  
  getUnreadCount: (userId: string) =>
    convexQuery<NotificationCount>("notifications/getUnreadCount", { userId }),
  
  // Mutations
  markRead: (id: string) =>
    convexMutation<boolean>("notifications/markRead", { id }),
  
  markAllRead: (userId: string) =>
    convexMutation<number>("notifications/markAllRead", { userId }),
  
  create: (notification: Omit<Notification, "_id" | "_creationTime" | "read" | "createdAt">) =>
    convexMutation<string>("notifications/create", notification),
  
  cleanup: (userId: string, olderThanDays: number) =>
    convexMutation<number>("notifications/cleanup", { userId, olderThanDays }),
};

// Polling-based reactive wrapper for React
export function createReactiveClient(pollInterval = 3000) {
  return {
    tasksApi,
    syncApi,
    pollInterval,
  };
}
