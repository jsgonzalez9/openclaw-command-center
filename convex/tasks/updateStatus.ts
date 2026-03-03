import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export default mutation({
  args: {
    id: v.id("tasks"),
    status: v.string(),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    const now = Date.now();
    const oldStatus = task.status;

    // Update task
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: now,
      completedAt: args.status === "completed" ? now : task.completedAt,
    });

    // Log activity
    await ctx.db.insert("taskActivity", {
      taskId: args.id,
      type: "status_changed",
      actor: "system",
      oldValue: oldStatus,
      newValue: args.status,
      message: `Status changed from "${oldStatus}" to "${args.status}"`,
      timestamp: now,
    });

    // Notify on certain status changes
    if (task.assignedTo !== "system") {
      if (args.status === "completed") {
        // Notify creator that task was completed
        await ctx.runMutation(api.notifications.create, {
          userId: task.createdBy,
          type: "task_completed",
          title: "Task Completed",
          message: `"${task.title}" has been completed`,
          taskId: args.id,
          project: task.project,
        });
      } else if (args.status === "blocked") {
        // Notify assignee that task is blocked
        await ctx.runMutation(api.notifications.create, {
          userId: task.assignedTo,
          type: "status_changed",
          title: "Task Blocked",
          message: `"${task.title}" is now blocked`,
          taskId: args.id,
          project: task.project,
        });
      }
    }

    return args.id;
  },
});
