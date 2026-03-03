/**
 * ClickUp Integration for Mission Control
 * Sync tasks between Mission Control and ClickUp
 */

const TEAM_ID = '10798941';

interface Task {
  id: string;
  title: string;
  description?: string;
  status:
    'backlog' | 'in-progress' | 'completed';
  priority: 'p0' | 'p1' | 'p2' | 'p3';
  assignee?: string;
  tags: string[];
  estimatedHours?: number;
}

interface ClickUpTask {
  id: string;
  name: string;
  description?: string;
  status: { status: string };
  priority?: { priority: string };
  assignees: { id: number }[];
  tags: { name: string }[];
  time_estimate?: number;
}

export class ClickUpClient {
  private apiKey: string;
  private baseUrl = 'https://api.clickup.com/api/v2';

  constructor() {
    this.apiKey = import.meta.env.VITE_CLICKUP_API_KEY || '';
  }

  private async request(endpoint: string, options?: RequestInit): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`ClickUp API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all spaces in the team
   */
  async getSpaces(): Promise<any[]> {
    const data = await this.request(`/team/${TEAM_ID}/space`);
    return data.spaces;
  }

  /**
   * Get all lists in a space
   */
  async getLists(spaceId: string): Promise<any[]> {
    const data = await this.request(`/space/${spaceId}/list`);
    return data.lists;
  }

  /**
   * Get all tasks from a list
   */
  async getTasks(listId: string): Promise<ClickUpTask[]> {
    const data = await this.request(`/list/${listId}/task`);
    return data.tasks;
  }

  /**
   * Create a new task in ClickUp
   */
  async createTask(listId: string, task: Partial<Task>): Promise<ClickUpTask> {
    const clickUpTask = {
      name: task.title,
      description: task.description,
      status: this.mapStatus(task.status),
      priority: this.mapPriority(task.priority),
      tags: task.tags,
      time_estimate: task.estimatedHours ? task.estimatedHours * 60 * 60 * 1000 : undefined,
    };

    return this.request(`/list/${listId}/task`, {
      method: 'POST',
      body: JSON.stringify(clickUpTask),
    });
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<ClickUpTask> {
    const clickUpUpdates: any = {};
    
    if (updates.title) clickUpUpdates.name = updates.title;
    if (updates.description) clickUpUpdates.description = updates.description;
    if (updates.status) clickUpUpdates.status = this.mapStatus(updates.status);
    if (updates.priority) clickUpUpdates.priority = this.mapPriority(updates.priority);
    if (updates.tags) clickUpUpdates.tags = updates.tags;
    if (updates.estimatedHours) {
      clickUpUpdates.time_estimate = updates.estimatedHours * 60 * 60 * 1000;
    }

    return this.request(`/task/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(clickUpUpdates),
    });
  }

  /**
   * Map Mission Control status to ClickUp status
   */
  private mapStatus(status: Task['status']): string {
    const statusMap: Record<string, string> = {
      'backlog': 'to do',
      'in-progress': 'in progress',
      'completed': 'complete',
    };
    return statusMap[status] || 'to do';
  }

  /**
   * Map Mission Control priority to ClickUp priority
   */
  private mapPriority(priority: Task['priority']): number {
    const priorityMap: Record<string, number> = {
      'p0': 1, // Urgent
      'p1': 2, // High
      'p2': 3, // Normal
      'p3': 4, // Low
    };
    return priorityMap[priority] || 3;
  }

  /**
   * Sync all Mission Control tasks to ClickUp
   */
  async syncTasksToClickUp(
    listId: string, 
    tasks: Task[]
  ): Promise<{ created: number; updated: number; errors: string[] }> {
    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const task of tasks) {
      try {
        // Check if task already exists (by title matching)
        const existingTasks = await this.getTasks(listId);
        const existing = existingTasks.find(t => t.name === task.title);

        if (existing) {
          // Update existing task
          await this.updateTask(existing.id, task);
          results.updated++;
        } else {
          // Create new task
          await this.createTask(listId, task);
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Failed to sync task ${task.id}: ${error}`);
      }
    }

    return results;
  }
}

// Export singleton
export const clickUpClient = new ClickUpClient();
