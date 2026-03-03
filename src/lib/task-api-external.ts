// External Task API Client
// For use by n8n, external services, or any client that needs HTTP access
// Uses the Convex HTTP action endpoints

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
  externalId?: string;
  source?: string;
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

export interface TaskActivity {
  _id: string;
  taskId: string;
  type: "created" | "updated" | "status_changed" | "assigned" | "completed" | "note_added";
  actor: string;
  oldValue?: string;
  newValue?: string;
  message?: string;
  timestamp: number;
}

export interface ApiResponse <T>{
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

class TaskApiClient {
  private baseUrl: string;

  constructor(baseUrl = CONVEX_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // GET /tasks - List all tasks with filters
  async list(filters?: {
    status?: string;
    assignedTo?: string;
    project?: string;
    limit?: number;
  }): Promise<ApiResponse<{ tasks: Task[]; count: number }>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.assignedTo) params.append("assignedTo", filters.assignedTo);
    if (filters?.project) params.append("project", filters.project);
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return this.fetch(`/api/tasks${queryString}`);
  }

  // GET /tasks/:id - Get a single task
  async get(id: string): Promise<ApiResponse<{ task: Task }>> {
    return this.fetch(`/api/tasks/${id}`);
  }

  // POST /tasks - Create a new task
  async create(task: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
    project?: string;
    dueDate?: number;
    tags?: string[];
    estimatedHours?: number;
    notes?: string;
    source?: string;
  }): Promise<ApiResponse<{ task: Task; id: string }>> {
    return this.fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  }

  // PATCH /tasks/:id - Update a task
  async update(
    id: string,
    updates: Partial<Omit<Task, "_id" | "createdAt" | "updatedAt">>
  ): Promise<ApiResponse<{ task: Task }>> {
    return this.fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  // DELETE /tasks/:id - Delete a task
  async remove(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  }

  // POST /tasks/:id/status - Update task status
  async updateStatus(id: string, status: Task["status"]): Promise<ApiResponse<{ task: Task }>> {
    return this.fetch(`/api/tasks/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  }

  // GET /tasks/board - Get tasks organized by status
  async getBoard(): Promise<ApiResponse<{ board: TaskBoard }>> {
    return this.fetch("/api/tasks/board");
  }

  // GET /tasks/stats - Get task statistics
  async getStats(): Promise<ApiResponse<{ stats: TaskStats }>> {
    return this.fetch("/api/tasks/stats");
  }

  // POST /tasks/:id/assign - Assign task
  async assign(id: string, assignedTo: Task["assignedTo"]): Promise<ApiResponse<{ task: Task }>> {
    return this.fetch(`/api/tasks/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ assignedTo }),
    });
  }

  // GET /tasks/activity/:id - Get task activity
  async getActivity(id: string): Promise<ApiResponse<{ activity: TaskActivity[] }>> {
    return this.fetch(`/api/tasks/activity/${id}`);
  }

  // GET /health - Health check
  async health(): Promise<ApiResponse<{ status: string; service: string; timestamp: number }>> {
    return this.fetch("/api/health");
  }
}

// Create default instance
export const taskApi = new TaskApiClient();

// Export class for custom instances
export { TaskApiClient };

// Export for n8n compatibility
export default taskApi;
