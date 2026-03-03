import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List notifications for a user
export const list = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number>(),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, limit = 50, unreadOnly = false } = args;
    
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
    
    if (unreadOnly) {
      return notifications.filter(n => !n.read);
    }
    
    return notifications;
  },
});

// Get unread count
export const getUnreadCount = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", args.userId).eq("read", false)
      )
      .collect();
    
    return notifications.length;
  },
});

// Create a notification
export const create = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    taskId: v.optional(v.id("tasks")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      read: false,
      taskId: args.taskId,
      metadata: args.metadata,
      createdAt: now,
    });
    
    return notificationId;
  },
});

// Mark notification as read
export const markRead = mutation({
  args: {
    id: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { read: true });
    return { success: true };
  },
});

// Mark all notifications as read for a user
export const markAllRead = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", args.userId).eq("read", false)
      )
      .collect();
    
    for (const notification of notifications) {
      await ctx.db.patch(notification._id, { read: true });
    }
    
    return { success: true, count: notifications.length };
  },
});

// Cleanup old notifications (keep last 100 per user)
export const cleanup = mutation({
  args: {
    userId: v.string(),
    keepLast: v.optional(v.number>(),
  },
  handler: async (ctx, args) => {
    const { userId, keepLast = 100 } = args;
    
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    
    if (notifications.length <= keepLast) {
      return { deleted: 0 };
    }
    
    const toDelete = notifications.slice(keepLast);
    for (const notification of toDelete) {
      await ctx.db.delete(notification._id);
    }
    
    return { deleted: toDelete.length };
  },
});