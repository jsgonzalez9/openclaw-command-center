import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Create a new notification
export default mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    taskId: v.optional(v.id("tasks")),
    project: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  returns: v.id("notifications"),
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      taskId: args.taskId,
      project: args.project,
      read: false,
      createdAt: Date.now(),
      metadata: args.metadata,
    });
    
    return id;
  },
});
