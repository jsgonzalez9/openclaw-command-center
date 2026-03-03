import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get sync state for an integration
export const getState = query({
  args: {
    integration: v.string(),
  },
  handler: async (ctx, args) => {
    const state = await ctx.db
      .query("syncState")
      .withIndex("by_integration", (q) => q.eq("integration", args.integration))
      .first();
    
    return state ?? {
      integration: args.integration,
      lastSyncAt: null,
      status: "idle",
      error: null,
    };
  },
});

// Trigger a sync (for ClickUp, GitHub, etc.)
export const trigger = mutation({
  args: {
    integration: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already syncing
    const existing = await ctx.db
      .query("syncState")
      .withIndex("by_integration", (q) => q.eq("integration", args.integration))
      .first();
    
    if (existing?.status === "syncing") {
      return { success: false, error: "Sync already in progress" };
    }
    
    const now = new Date().toISOString();
    
    // Create or update sync state
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "syncing",
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("syncState", {
        integration: args.integration,
        lastSyncAt: now,
        status: "syncing",
      });
    }
    
    // In a real implementation, this would kick off a background job
    // For now, we'll just return success
    
    return { success: true, message: `Sync triggered for ${args.integration}` };
  },
});

// Mark sync as complete
export const complete = mutation({
  args: {
    integration: v.string(),
    error: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("syncState")
      .withIndex("by_integration", (q) => q.eq("integration", args.integration))
      .first();
    
    const now = new Date().toISOString();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSyncAt: now,
        status: args.error ? "error" : "idle",
        error: args.error,
        metadata: args.metadata,
      });
    } else {
      await ctx.db.insert("syncState", {
        integration: args.integration,
        lastSyncAt: now,
        status: args.error ? "error" : "idle",
        error: args.error,
        metadata: args.metadata,
      });
    }
    
    return { success: true };
  },
});