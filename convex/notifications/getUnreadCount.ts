import { v } from "convex/values";
import { query } from "./_generated/server";

// Get count of unread notifications for a user
export default query({
  args: {
    userId: v.string(),
  },
  returns: v.object({
    total: v.number(),
    byType: v.record(v.string(), v.number()),
  }),
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId_unread", (q) => 
        q.eq("userId", args.userId).eq("read", false)
      )
      .collect();
    
    const byType: Record<string, number> = {};
    for (const n of notifications) {
      byType[n.type] = (byType[n.type] || 0) + 1;
    }
    
    return {
      total: notifications.length,
      byType,
    };
  },
});
