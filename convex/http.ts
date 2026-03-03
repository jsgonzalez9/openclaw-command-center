import { httpRouter } from "convex/server";
import { httpAction, Id } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Task API Routes - RESTful HTTP endpoints for external integration
// These endpoints allow external services (n8n, ClickUp, etc.) to interact with tasks

const http = httpRouter();

// Helper to send JSON response
const jsonResponse = (data: unknown, status = 200) => ({
  status,
  body: JSON.stringify(data),
  headers: { "Content-Type": "application/json" },
});

// Helper for error responses
const errorResponse = (message: string, status = 400) =>
  jsonResponse({ error: message, success: false }, status);

// GET /tasks - List all tasks with optional filters
http.route({
  path: "/tasks",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") ?? undefined;
    const assignedTo = url.searchParams.get("assignedTo") ?? undefined;
    const project = url.searchParams.get("project") ?? undefined;
    const limit = parseInt(url.searchParams.get("limit") || "100");

    try {
      let query = ctx.runQuery(api.tasks.list, {
        status,
        assignedTo,
        project,
        limit,
      });

      const tasks = await query;
      return jsonResponse({ success: true, tasks, count: tasks.length });
    } catch (error) {
      console.error("Failed to list tasks:", error);
      return errorResponse("Failed to fetch tasks", 500);
    }
  }),
});

// GET /tasks/:id - Get a single task by ID
http.route({
  path: "/tasks/:id",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return errorResponse("Task ID is required", 400);
    }

    try {
      const task = await ctx.runQuery(api.tasks.get, { id });
      if (!task) {
        return errorResponse("Task not found", 404);
      }
      return jsonResponse({ success: true, task });
    } catch (error) {
      console.error("Failed to get task:", error);
      return errorResponse("Failed to fetch task", 500);
    }
  }),
});

// POST /tasks - Create a new task
http.route({
  path: "/tasks",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      // Validate required fields
      if (!body.title || typeof body.title !== "string") {
        return errorResponse("Title is required and must be a string", 400);
      }

      const taskId = await ctx.runMutation(api.tasks.create, {
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        assignedTo: body.assignedTo,
        project: body.project,
        dueDate: body.dueDate ? Number(body.dueDate) : undefined,
        tags: body.tags,
        estimatedHours: body.estimatedHours ? Number(body.estimatedHours) : undefined,
        notes: body.notes,
        source: body.source || "api",
      });

      const task = await ctx.runQuery(api.tasks.get, { id: taskId });

      return jsonResponse({ success: true, task, id: taskId }, 201);
    } catch (error) {
      console.error("Failed to create task:", error);
      return errorResponse(
        error instanceof Error ? error.message : "Failed to create task",
        500
      );
    }
  }),
});

// PATCH /tasks/:id - Update a task
http.route({
  path: "/tasks/:id",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return errorResponse("Task ID is required", 400);
    }

    try {
      const body = await request.json();
      const updates: Record<string, unknown> = {};

      // Validate and collect allowed fields
      const allowedFields = [
        "title",
        "description",
        "status",
        "priority",
        "assignedTo",
        "project",
        "dueDate",
        "tags",
        "estimatedHours",
        "actualHours",
        "notes",
      ];

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updates[field] = body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return errorResponse("No valid fields to update", 400);
      }

      await ctx.runMutation(api.tasks.update, { id, ...updates });
      const task = await ctx.runQuery(api.tasks.get, { id });

      return jsonResponse({ success: true, task });
    } catch (error) {
      console.error("Failed to update task:", error);
      return errorResponse(
        error instanceof Error ? error.message : "Failed to update task",
        500
      );
    }
  }),
});

// DELETE /tasks/:id - Delete a task
http.route({
  path: "/tasks/:id",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return errorResponse("Task ID is required", 400);
    }

    try {
      await ctx.runMutation(api.tasks.remove, { id });
      return jsonResponse({ success: true, message: "Task deleted" });
    } catch (error) {
      console.error("Failed to delete task:", error);
      return errorResponse(
        error instanceof Error ? error.message : "Failed to delete task",
        500
      );
    }
  }),
});

// POST /tasks/:id/status - Update task status (convenience endpoint)
http.route({
  path: "/tasks/:id/status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const id = url.pathname.split("/").slice(-2)[0];

    if (!id) {
      return errorResponse("Task ID is required", 400);
    }

    try {
      const body = await request.json();

      if (!body.status || typeof body.status !== "string") {
        return errorResponse("Status is required", 400);
      }

      const validStatuses = [
        "pending",
        "in_progress",
        "review",
        "blocked",
        "completed",
        "cancelled",
      ];

      if (!validStatuses.includes(body.status)) {
        return errorResponse(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          400
        );
      }

      await ctx.runMutation(api.tasks.updateStatus, { id, status: body.status });
      const task = await ctx.runQuery(api.tasks.get, { id });

      return jsonResponse({ success: true, task });
    } catch (error) {
      console.error("Failed to update status:", error);
      return errorResponse(
        error instanceof Error ? error.message : "Failed to update status",
        500
      );
    }
  }),
});

// GET /tasks/board - Get tasks organized by status (Kanban board data)
http.route({
  path: "/tasks/board",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const board = await ctx.runQuery(api.tasks.getBoard);
      return jsonResponse({ success: true, board });
    } catch (error) {
      console.error("Failed to get board:", error);
      return errorResponse("Failed to fetch board", 500);
    }
  }),
});

// GET /tasks/stats - Get task statistics
http.route({
  path: "/tasks/stats",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const stats = await ctx.runQuery(api.tasks.getStats);
      return jsonResponse({ success: true, stats });
    } catch (error) {
      console.error("Failed to get stats:", error);
      return errorResponse("Failed to fetch stats", 500);
    }
  }),
});

// POST /tasks/:id/assign - Assign task to user/agent
http.route({
  path: "/tasks/:id/assign",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const id = url.pathname.split("/").slice(-2)[0];

    if (!id) {
      return errorResponse("Task ID is required", 400);
    }

    try {
      const body = await request.json();

      if (!body.assignedTo || typeof body.assignedTo !== "string") {
        return errorResponse("assignedTo is required", 400);
      }

      const validAssignees = [
        "user",
        "ai",
        "senior_dev",
        "copywriter",
        "external",
      ];

      if (!validAssignees.includes(body.assignedTo)) {
        return errorResponse(
          `Invalid assignee. Must be one of: ${validAssignees.join(", ")}`,
          400
        );
      }

      await ctx.runMutation(api.tasks.assign, { id, assignedTo: body.assignedTo });
      const task = await ctx.runQuery(api.tasks.get, { id });

      return jsonResponse({ success: true, task });
    } catch (error) {
      console.error("Failed to assign task:", error);
      return errorResponse(
        error instanceof Error ? error.message : "Failed to assign task",
        500
      );
    }
  }),
});

// GET /tasks/activity/:id - Get task activity log
http.route({
  path: "/tasks/activity/:id",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return errorResponse("Task ID is required", 400);
    }

    try {
      const activity = await ctx.runQuery(api.tasks.getActivity, { taskId: id });
      return jsonResponse({ success: true, activity });
    } catch (error) {
      console.error("Failed to get activity:", error);
      return errorResponse("Failed to fetch activity", 500);
    }
  }),
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return jsonResponse({
      success: true,
      status: "healthy",
      service: "mission-control-api",
      timestamp: Date.now(),
    });
  }),
});

// NOTIFICATION ENDPOINTS

// GET /notifications/:userId - Get notifications for a user
http.route({
  path: "/notifications/:userId",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const userId = url.pathname.split("/").pop();
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";
    const limit = parseInt(url.searchParams.get("limit") || "50");

    if (!userId) {
      return errorResponse("User ID is required", 400);
    }

    try {
      const notifications = await ctx.runQuery(api.notifications.list, {
        userId,
        unreadOnly,
        limit,
      });
      return jsonResponse({ success: true, notifications });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return errorResponse("Failed to fetch notifications", 500);
    }
  }),
});

// GET /notifications/:userId/count - Get unread notification count
http.route({
  path: "/notifications/:userId/count",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const userId = url.pathname.split("/").slice(-2)[0];

    if (!userId) {
      return errorResponse("User ID is required", 400);
    }

    try {
      const count = await ctx.runQuery(api.notifications.getUnreadCount, { userId });
      return jsonResponse({ success: true, ...count });
    } catch (error) {
      console.error("Failed to get notification count:", error);
      return errorResponse("Failed to get count", 500);
    }
  }),
});

// POST /notifications/:id/read - Mark notification as read
http.route({
  path: "/notifications/:id/read",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const id = url.pathname.split("/").slice(-2)[0] as Id<"notifications">;

    if (!id) {
      return errorResponse("Notification ID is required", 400);
    }

    try {
      const success = await ctx.runMutation(api.notifications.markRead, { id });
      return jsonResponse({ success, message: success ? "Marked as read" : "Not found" });
    } catch (error) {
      console.error("Failed to mark as read:", error);
      return errorResponse("Failed to update notification", 500);
    }
  }),
});

// POST /notifications/:userId/read-all - Mark all notifications as read
http.route({
  path: "/notifications/:userId/read-all",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const userId = url.pathname.split("/").slice(-2)[0];

    if (!userId) {
      return errorResponse("User ID is required", 400);
    }

    try {
      const count = await ctx.runMutation(api.notifications.markAllRead, { userId });
      return jsonResponse({ success: true, count, message: `${count} notifications marked as read` });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      return errorResponse("Failed to update notifications", 500);
    }
  }),
});

// POST /notifications - Create a notification (for external systems)
http.route({
  path: "/notifications",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      if (!body.userId || !body.type || !body.title || !body.message) {
        return errorResponse("userId, type, title, and message are required", 400);
      }

      const id = await ctx.runMutation(api.notifications.create, {
        userId: body.userId,
        type: body.type,
        title: body.title,
        message: body.message,
        taskId: body.taskId,
        project: body.project,
        metadata: body.metadata,
      });

      return jsonResponse({ success: true, id }, 201);
    } catch (error) {
      console.error("Failed to create notification:", error);
      return errorResponse(
        error instanceof Error ? error.message : "Failed to create notification",
        500
      );
    }
  }),
});

export default http;
