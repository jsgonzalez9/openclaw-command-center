import { query } from "./_generated/server";
import { v } from "convex/values";

export default query({
  args: {
    taskId: v.id("tasks"),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const activities = await ctx.db.query("taskActivity")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .take(args.limit ?? 50);

    return activities;
  },
});
