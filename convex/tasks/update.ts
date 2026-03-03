import { mutation } from "./_generated/server";
import { v } from "convex/values";

export default mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    project: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    const task = await ctx.db.get(id);
    if (!task) {
      throw new Error("Task not found");
    }

    const now = Date.now();

    // Build update object
    const patchData: any = {
      updatedAt: now,
    };

    if (updates.title !== undefined) patchData.title = updates.title;
    if (updates.description !== undefined) patchData.description = updates.description;
    if (updates.status !== undefined) {
      patchData.status = updates.status;
      if (updates.status === "completed") {
        patchData.completedAt = now;
      }
    }
    if (updates.priority !== undefined) patchData.priority = updates.priority;
    if (updates.assignedTo !== undefined) patchData.assignedTo = updates.assignedTo;
    if (updates.project !== undefined) patchData.project = updates.project;
    if (updates.dueDate !== undefined) patchData.dueDate = updates.dueDate;
    if (updates.tags !== undefined) patchData.tags = updates.tags;
    if (updates.estimatedHours !== undefined) patchData.estimatedHours = updates.estimatedHours;
    if (updates.actualHours !== undefined) patchData.actualHours = updates.actualHours;
    if (updates.notes !== undefined) patchData.notes = updates.notes;

    // Update task
    await ctx.db.patch(id, patchData);

    // Log activity
    const changedFields = Object.keys(updates).filter(k => k !== "id");
    if (changedFields.length > 0) {
      await ctx.db.insert("taskActivity", {
        taskId: id,
        type: "updated",
        actor: "system",
        message: `Updated fields: ${changedFields.join(", ")}`,
        timestamp: now,
      });
    }

    return id;
  },
});
