import { v } from "convex/values";
import { query } from "./_generated/server";

// Get notifications for a user with optional filters
export default query({
  args: {
    userId: v.string(),
    unreadOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("notifications"),
      _creationTime: v.number(),
      userId: v.string(),
      type: v.string(),
      title: v.string(),
      message: v.string(),
      taskId: v.optional(v.id("tasks")),
      project: v.optional(v.string()),
      read: v.boolean(),
      createdAt: v.number(),
      readAt: v.optional(v.number()),
      metadata: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    
    if (args.unreadOnly) {
      return await ctx.db
        .query("notifications")
        .withIndex("by_userId_unread", (q) => 
          q.eq("userId", args.userId).eq("read", false)
        )
        .order("desc")
        .take(limit);
    }
    
    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});
