import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Complete a sync operation with results
export default mutation({
  args: {
    success: v.boolean(),
    tasksSynced: v.number(),
    tasksFailed: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const syncState = await ctx.db
      .query("syncState")
      .withIndex("by_source", (q) => q.eq("source", "clickup"))
      .unique();

    if (!syncState) {
      throw new Error("No sync state found");
    }

    await ctx.db.patch(syncState._id, {
      status: args.success ? "idle" : "error",
      tasksSynced: args.tasksSynced,
      tasksFailed: args.tasksFailed ?? 0,
      errorMessage: args.errorMessage,
      lastSyncAt: Date.now(),
    });

    return {
      id: syncState._id,
      status: args.success ? "idle" : "error",
    };
  },
});
