import { query } from "./_generated/server";
import { v } from "convex/values";

export default query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const [pending, in_progress, review, blocked, completed] = await Promise.all([
      ctx.db.query("tasks")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .order("desc")
        .take(100),
      ctx.db.query("tasks")
        .withIndex("by_status", (q) => q.eq("status", "in_progress"))
        .order("desc")
        .take(100),
      ctx.db.query("tasks")
        .withIndex("by_status", (q) => q.eq("status", "review"))
        .order("desc")
        .take(100),
      ctx.db.query("tasks")
        .withIndex("by_status", (q) => q.eq("status", "blocked"))
        .order("desc")
        .take(100),
      ctx.db.query("tasks")
        .withIndex("by_status", (q) => q.eq("status", "completed"))
        .order("desc")
        .take(100),
    ]);

    return {
      pending,
      in_progress,
      review,
      blocked,
      completed,
    };
  },
});
