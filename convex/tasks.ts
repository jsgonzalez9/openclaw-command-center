import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List all tasks with optional filters
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("backlog"),
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("blocked"),
      v.literal("completed")
    )),
    assignedTo: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { status, assignedTo, projectId, limit = 100 } = args;
    
    let tasks;
    if (status) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", status))
        .take(limit);
    } else {
      tasks = await ctx.db.query("tasks").take(limit);
    }
    
    // Filter by assignedTo if provided
    if (assignedTo) {
      tasks = tasks.filter(t => t.assignedTo === assignedTo);
    }
    
    // Filter by projectId if provided
    if (projectId) {
      tasks = tasks.filter(t => t.projectId === projectId);
    }
    
    return tasks.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
});

// Get a single task by ID
export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("backlog"),
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("blocked"),
      v.literal("completed")
    )),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
    assignedTo: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    tags: v.optional(v.array(v.string())),
    dueDate: v.optional(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description ?? "",
      status: args.status ?? "backlog",
      priority: args.priority ?? "medium",
      assignedTo: args.assignedTo,
      projectId: args.projectId,
      tags: args.tags,
      dueDate: args.dueDate,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
    });
    
    // Log activity
    await ctx.db.insert("taskActivity", {
      taskId,
      action: "created",
      userId: args.createdBy,
      timestamp: now,
    });
    
    return taskId;
  },
});

// Update a task
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("backlog"),
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("blocked"),
      v.literal("completed")
    )),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
    assignedTo: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    tags: v.optional(v.array(v.string())),
    dueDate: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...updates } = args;
    const task = await ctx.db.get(id);
    if (!task) throw new Error("Task not found");
    
    const now = new Date().toISOString();
    const changes: { field: string; oldValue?: string; newValue?: string }[] = [];
    
    // Track changes
    for (const [field, newValue] of Object.entries(updates)) {
      if (newValue !== undefined && (task as any)[field] !== newValue) {
        changes.push({
          field,
          oldValue: String((task as any)[field] ?? ""),
          newValue: String(newValue),
        });
      }
    }
    
    // Update the task
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    });
    
    // Log activities
    for (const change of changes) {
      await ctx.db.insert("taskActivity", {
        taskId: id,
        action: "updated",
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        userId,
        timestamp: now,
      });
    }
    
    return await ctx.db.get(id);
  },
});

// Update task status specifically
export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("backlog"),
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("blocked"),
      v.literal("completed")
    ),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");
    
    const now = new Date().toISOString();
    const oldStatus = task.status;
    
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: now,
    });
    
    // Log activity
    await ctx.db.insert("taskActivity", {
      taskId: args.id,
      action: "status_changed",
      field: "status",
      oldValue: oldStatus,
      newValue: args.status,
      userId: args.userId,
      timestamp: now,
    });
    
    return await ctx.db.get(args.id);
  },
});

// Assign task to user
export const assign = mutation({
  args: {
    id: v.id("tasks"),
    assignedTo: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");
    
    const now = new Date().toISOString();
    
    await ctx.db.patch(args.id, {
      assignedTo: args.assignedTo,
      updatedAt: now,
    });
    
    // Log activity
    await ctx.db.insert("taskActivity", {
      taskId: args.id,
      action: "assigned",
      field: "assignedTo",
      oldValue: task.assignedTo,
      newValue: args.assignedTo,
      userId: args.userId,
      timestamp: now,
    });
    
    return await ctx.db.get(args.id);
  },
});

// Delete a task
export const remove = mutation({
  args: {
    id: v.id("tasks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");
    
    const now = new Date().toISOString();
    
    // Log activity before deletion
    await ctx.db.insert("taskActivity", {
      taskId: args.id,
      action: "deleted",
      newValue: task.title,
      userId: args.userId,
      timestamp: now,
    });
    
    await ctx.db.delete(args.id);
    return { success: true, deletedId: args.id };
  },
});

// Get board view (grouped by status)
export const getBoard = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    
    const board = {
      backlog: tasks.filter(t => t.status === "backlog"),
      pending: tasks.filter(t => t.status === "pending"),
      in_progress: tasks.filter(t => t.status === "in_progress"),
      review: tasks.filter(t => t.status === "review"),
      blocked: tasks.filter(t => t.status === "blocked"),
      completed: tasks.filter(t => t.status === "completed"),
    };
    
    return board;
  },
});

// Get task statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    
    const stats = {
      total: tasks.length,
      byStatus: {
        backlog: tasks.filter(t => t.status === "backlog").length,
        pending: tasks.filter(t => t.status === "pending").length,
        in_progress: tasks.filter(t => t.status === "in_progress").length,
        review: tasks.filter(t => t.status === "review").length,
        blocked: tasks.filter(t => t.status === "blocked").length,
        completed: tasks.filter(t => t.status === "completed").length,
      },
      byPriority: {
        low: tasks.filter(t => t.priority === "low").length,
        medium: tasks.filter(t => t.priority === "medium").length,
        high: tasks.filter(t => t.priority === "high").length,
        urgent: tasks.filter(t => t.priority === "urgent").length,
      },
      overdue: 0,
    };
    
    // Count overdue tasks
    const now = new Date();
    stats.overdue = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < now && t.status !== "completed"
    ).length;
    
    return stats;
  },
});

// Get activity log for a task
export const getActivity = query({
  args: {
    taskId: v.id("tasks"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { taskId, limit = 50 } = args;
    
    const activity = await ctx.db
      .query("taskActivity")
      .withIndex("by_task", (q) => q.eq("taskId", taskId))
      .order("desc")
      .take(limit);
    
    return activity;
  },
});