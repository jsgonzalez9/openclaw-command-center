import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    id: v.id("tasks"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    const now = Date.now();
    const taskTitle = task.title;

    // Delete all activity logs for this task first
    const activities = await ctx.db.query("taskActivity")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.id))
      .collect();
    
    for (const activity of activities) {
      await ctx.db.delete(activity._id);
    }

    // Delete the task
    await ctx.db.delete(args.id);

    // Log deletion
    console.log(`Task deleted: "${taskTitle}" at ${now}`);

    return null;
  },
});
