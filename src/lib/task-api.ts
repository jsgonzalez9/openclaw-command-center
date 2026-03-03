// Mission Control Task API Client
// Usage: import { taskApi } from "@/lib/task-api";

const API_BASE = "/api/tasks";

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
  tags: string[];
  estimatedHours?: number;
  notes?: string;
}

export interface TaskFilters {
  status?: string;
  assignedTo?: string;
  project?: string;
}

export interface TaskStats {
  total: number;
  byStatus: Record<string, number>;
  byAssignee: Record<string, number>;
  completedToday: number;
}

export const taskApi = {
  // List tasks with optional filters
  async list(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.assignedTo) params.set("assignedTo", filters.assignedTo);
    if (filters?.project) params.set("project", filters.project);
    
    const res = await fetch(`${API_BASE}?${params}`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  },

  // Get single task by ID
  async get(id: string): Promise<Task> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error("Task not found");
    return res.json();
  },

  // Create a new task
  async create(data: Partial<Task>): Promise<Task> {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create task");
    return res.json();
  },

  // Update a task
  async update(id: string, data: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
  },

  // Delete a task
  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    return res.ok;
  },

  // Update task status
  async updateStatus(id: string, status: Task["status"]): Promise<Task> {
    const res = await fetch(`${API_BASE}/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
  },

  // Assign task
  async assign(id: string, assignedTo: Task["assignedTo"]): Promise<Task> {
    const res = await fetch(`${API_BASE}/${id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo }),
    });
    if (!res.ok) throw new Error("Failed to assign task");
    return res.json();
  },

  // Get Kanban board view
  async getBoard(): Promise<Record<string, Task[]>> {
    const res = await fetch(`${API_BASE}/board`);
    if (!res.ok) throw new Error("Failed to fetch board");
    return res.json();
  },

  // Get task statistics
  async getStats(): Promise<TaskStats> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },
};

export default taskApi;
