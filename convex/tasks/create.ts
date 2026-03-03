import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export default mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    project: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    estimatedHours: v.optional(v.number()),
    notes: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const assignedTo = args.assignedTo || "user";
    
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: args.status || "pending",
      priority: args.priority || "p2_medium",
      assignedTo: assignedTo,
      project: args.project || "general",
      createdBy: "system",
      createdAt: now,
      updatedAt: now,
      dueDate: args.dueDate,
      tags: args.tags,
      estimatedHours: args.estimatedHours,
      actualHours: undefined,
      notes: args.notes,
      source: args.source || "manual",
    });

    // Log activity
    await ctx.db.insert("taskActivity", {
      taskId,
      type: "created",
      actor: "system",
      newValue: args.status || "pending",
      message: `Task "${args.title}" created`,
      timestamp: now,
    });

    // Notify assignee
    if (assignedTo !== "system") {
      await ctx.runMutation(api.notifications.create, {
        userId: assignedTo,
        type: "task_assigned",
        title: "New Task Assigned",
        message: `"${args.title}" has been assigned to you`,
        taskId,
        project: args.project || "general",
      });
    }

    return taskId;
  },
});
