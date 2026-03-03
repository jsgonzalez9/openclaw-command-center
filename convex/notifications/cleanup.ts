import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Delete old read notifications (cleanup)
export default mutation({
  args: {
    userId: v.string(),
    olderThanDays: v.number(), // Delete notifications older than X days
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const cutoffTime = Date.now() - (args.olderThanDays * 24 * 60 * 60 * 1000);
    
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.and(
        q.eq(q.field("read"), true),
        q.lt(q.field("createdAt"), cutoffTime)
      ))
      .collect();
    
    for (const n of notifications) {
      await ctx.db.delete(n._id);
    }
    
    return notifications.length;
  },
});
