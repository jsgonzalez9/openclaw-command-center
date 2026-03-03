import { query } from "./_generated/server";
import { v } from "convex/values";

export default query({
  args: {
    status: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    project: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let query = ctx.db.query("tasks");

    // Apply status filter
    if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    }
    // Apply assignedTo filter  
    else if (args.assignedTo) {
      query = query.withIndex("by_assignedTo", (q) => q.eq("assignedTo", args.assignedTo));
    }
    // Apply project filter
    else if (args.project) {
      query = query.withIndex("by_project", (q) => q.eq("project", args.project));
    }

    // Order by createdAt desc
    const tasks = await query.order("desc").take(args.limit ?? 100);

    return tasks;
  },
});
