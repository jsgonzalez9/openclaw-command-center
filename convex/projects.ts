import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List all projects
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("archived")
    )),
  },
  handler: async (ctx, args) => {
    const { status } = args;
    
    if (status) {
      return await ctx.db
        .query("projects")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
    }
    
    return await ctx.db.query("projects").collect();
  },
});

// Get a single project
export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new project
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      color: args.color,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    
    return projectId;
  },
});

// Update a project
export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("archived")
    )),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = new Date().toISOString();
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    });
    
    return await ctx.db.get(id);
  },
});

// Archive a project
export const archive = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    await ctx.db.patch(args.id, {
      status: "archived",
      updatedAt: now,
    });
    
    return await ctx.db.get(args.id);
  },
});

// Delete a project
export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    // Check for associated tasks
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();
    
    if (tasks.length > 0) {
      // Unassign tasks from this project
      for (const task of tasks) {
        await ctx.db.patch(task._id, { projectId: undefined });
      }
    }
    
    await ctx.db.delete(args.id);
    return { success: true };
  },
});