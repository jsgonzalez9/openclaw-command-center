import { query } from "./_generated/server";
import { v } from "convex/values";

// Get the current sync state for ClickUp integration
export default query({
  args: {},
  returns: v.object({
    lastSyncAt: v.union(v.number(), v.null()),
    status: v.string(),
    tasksSynced: v.number(),
    tasksFailed: v.number(),
    errorMessage: v.union(v.string(), v.null()),
  }),
  handler: async (ctx) => {
    const syncState = await ctx.db
      .query("syncState")
      .withIndex("by_source", (q) => q.eq("source", "clickup"))
      .unique();

    if (!syncState) {
      return {
        lastSyncAt: null,
        status: "idle" as const,
        tasksSynced: 0,
        tasksFailed: 0,
        errorMessage: null,
      };
    }

    return {
      lastSyncAt: syncState.lastSyncAt,
      status: syncState.status as "idle" | "syncing" | "error",
      tasksSynced: syncState.tasksSynced,
      tasksFailed: syncState.tasksFailed,
      errorMessage: syncState.errorMessage || null,
    };
  },
});
