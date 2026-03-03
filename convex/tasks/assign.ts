import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export default mutation({
  args: {
    id: v.id("tasks"),
    assignedTo: v.string(),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    const now = Date.now();
    const oldAssignee = task.assignedTo;

    // Update task
    await ctx.db.patch(args.id, {
      assignedTo: args.assignedTo,
      updatedAt: now,
    });

    // Log activity
    await ctx.db.insert("taskActivity", {
      taskId: args.id,
      type: "assigned",
      actor: "system",
      oldValue: oldAssignee,
      newValue: args.assignedTo,
      message: `Reassigned from "${oldAssignee}" to "${args.assignedTo}"`,
      timestamp: now,
    });

    // Notify new assignee (excluding the old assignee and system)
    if (args.assignedTo !== oldAssignee && args.assignedTo !== "system") {
      await ctx.runMutation(api.notifications.create, {
        userId: args.assignedTo,
        type: "task_assigned",
        title: "Task Assigned to You",
        message: `"${task.title}" has been assigned to you`,
        taskId: args.id,
        project: task.project,
      });
    }

    return args.id;
  },
});
