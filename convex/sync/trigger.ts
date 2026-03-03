import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Trigger a ClickUp sync - creates/updates syncState entry
export default mutation({
  args: {
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, { dryRun = false }) => {
    const now = Date.now();
    
    // Check if there's an existing sync state
    let syncState = await ctx.db
      .query("syncState")
      .withIndex("by_source", (q) => q.eq("source", "clickup"))
      .unique();

    // If already syncing, return early
    if (syncState && syncState.status === "syncing") {
      return {
        id: syncState._id,
        status: "syncing",
        message: "Sync already in progress",
      };
    }

    if (syncState) {
      // Update existing
      await ctx.db.patch(syncState._id, {
        status: "syncing",
        lastSyncAt: now,
        tasksSynced: 0,
        tasksFailed: 0,
        errorMessage: undefined,
      });
    } else {
      // Create new
      syncState = await ctx.db.insert("syncState", {
        source: "clickup",
        status: "syncing",
        lastSyncAt: now,
        tasksSynced: 0,
        tasksFailed: 0,
      });
    }

    // In a real implementation, this would:
    // 1. Call ClickUp API to fetch tasks
    // 2. Map ClickUp fields to our schema
    // 3. Insert/update tasks in our DB
    // 4. Update syncState with results
    
    // For now, we return immediately and the sync would be handled
    // by a scheduled job or edge function
    
    return {
      id: syncState._id,
      status: "syncing",
      message: dryRun ? "Dry run started" : "Sync triggered",
      startedAt: now,
    };
  },
});
