import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Mark a notification as read
export default mutation({
  args: {
    id: v.id("notifications"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.id);
    if (!notification) {
      return false;
    }
    
    await ctx.db.patch(args.id, {
      read: true,
      readAt: Date.now(),
    });
    
    return true;
  },
});
