import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Mark all notifications as read for a user
export default mutation({
  args: {
    userId: v.string(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId_unread", (q) => 
        q.eq("userId", args.userId).eq("read", false)
      )
      .collect();
    
    let count = 0;
    for (const n of notifications) {
      await ctx.db.patch(n._id, {
        read: true,
        readAt: Date.now(),
      });
      count++;
    }
    
    return count;
  },
});
