import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // "pending" | "in_progress" | "review" | "blocked" | "completed" | "cancelled"
    priority: v.string(), // "p0_critical" | "p1_high" | "p2_medium" | "p3_low"
    assignedTo: v.string(), // "user" | "ai" | "senior_dev" | "copywriter" | "external"
    project: v.string(), // "lux_haven" | "ai_automation" | "mission_control" | "infrastructure" | "general"
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    notes: v.optional(v.string()),
    externalId: v.optional(v.string()), // For ClickUp sync
    source: v.optional(v.string()), // "clickup", "manual", "system"
  })
    .index("by_status", ["status"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_project", ["project"])
    .index("by_priority", ["priority"])
    .index("by_createdAt", ["createdAt"])
    .index("by_externalId", ["externalId"]),

  taskActivity: defineTable({
    taskId: v.id("tasks"),
    type: v.string(), // "created", "updated", "status_changed", "assigned", "completed", "note_added"
    actor: v.string(),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    message: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_taskId", ["taskId"])
    .index("by_timestamp", ["timestamp"]),

  syncState: defineTable({
    lastSyncAt: v.number(),
    source: v.string(), // "clickup"
    status: v.string(), // "idle", "syncing", "error"
    errorMessage: v.optional(v.string()),
    tasksSynced: v.number(),
    tasksFailed: v.number(),
  }).index("by_source", ["source"]),

  // Notifications table for WebSocket-style real-time alerts
  notifications: defineTable({
    userId: v.string(), // "user", "ai", "senior_dev", "copywriter", "external"
    type: v.string(), // "task_assigned", "task_completed", "task_comment", "status_changed", "due_soon", "system"
    title: v.string(),
    message: v.string(),
    taskId: v.optional(v.id("tasks")),
    project: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
    metadata: v.optional(v.string()), // JSON string for extra data
  })
    .index("by_userId", ["userId"])
    .index("by_userId_unread", ["userId", "read"])
    .index("by_taskId", ["taskId"])
    .index("by_createdAt", ["createdAt"]),
});
