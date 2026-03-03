import { describe, it, expect, beforeAll } from "vitest";
import { taskApi, TaskApiClient } from "@/lib/task-api-external";

// Task API Endpoint Tests
// Run with: npm test src/test/task-api.test.ts

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://witty-raptor-257.convex.cloud";

describe("Task API Endpoints", () => {
  let testTaskId: string | null = null;
  const api = new TaskApiClient(CONVEX_URL);

  describe("Health Check", () => {
    it("should return healthy status", async () => {
      const response = await api.health();
      expect(response.success).toBe(true);
      expect(response.data?.status).toBe("healthy");
      expect(response.data?.service).toBe("mission-control-api");
    });
  });

  describe("Task CRUD Operations", () => {
    it("should create a new task", async () => {
      const taskData = {
        title: "Test Task from API",
        description: "This is a test task created via the HTTP API",
        priority: "p2_medium" as const,
        assignedTo: "ai" as const,
        project: "mission_control" as const,
        estimatedHours: 2,
        tags: ["test", "api"],
      };

      const response = await api.create(taskData);
      expect(response.success).toBe(true);
      expect(response.data?.task.title).toBe(taskData.title);
      expect(response.data?.task.status).toBe("pending");
      expect(response.data?.id).toBeDefined();

      testTaskId = response.data?.id || null;
    });

    it("should list tasks", async () => {
      const response = await api.list({ limit: 10 });
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data?.tasks)).toBe(true);
      expect(typeof response.data?.count).toBe("number");
    });

    it("should filter tasks by status", async () => {
      const response = await api.list({ status: "pending", limit: 5 });
      expect(response.success).toBe(true);
      expect(response.data?.tasks.every((t) => t.status === "pending")).toBe(true);
    });

    it("should get a single task", async () => {
      if (!testTaskId) {
        throw new Error("No test task ID available");
      }

      const response = await api.get(testTaskId);
      expect(response.success).toBe(true);
      expect(response.data?.task._id).toBe(testTaskId);
      expect(response.data?.task.title).toBe("Test Task from API");
    });

    it("should update a task", async () => {
      if (!testTaskId) {
        throw new Error("No test task ID available");
      }

      const updates = {
        title: "Updated Test Task",
        priority: "p1_high" as const,
        estimatedHours: 3,
      };

      const response = await api.update(testTaskId, updates);
      expect(response.success).toBe(true);
      expect(response.data?.task.title).toBe(updates.title);
      expect(response.data?.task.priority).toBe(updates.priority);
    });

    it("should update task status", async () => {
      if (!testTaskId) {
        throw new Error("No test task ID available");
      }

      const response = await api.updateStatus(testTaskId, "in_progress");
      expect(response.success).toBe(true);
      expect(response.data?.task.status).toBe("in_progress");
    });

    it("should assign task to different user", async () => {
      if (!testTaskId) {
        throw new Error("No test task ID available");
      }

      const response = await api.assign(testTaskId, "senior_dev");
      expect(response.success).toBe(true);
      expect(response.data?.task.assignedTo).toBe("senior_dev");
    });

    it("should get task board", async () => {
      const response = await api.getBoard();
      expect(response.success).toBe(true);
      expect(response.data?.board).toBeDefined();
      expect(Array.isArray(response.data?.board.pending)).toBe(true);
      expect(Array.isArray(response.data?.board.in_progress)).toBe(true);
      expect(Array.isArray(response.data?.board.completed)).toBe(true);
    });

    it("should get task stats", async () => {
      const response = await api.getStats();
      expect(response.success).toBe(true);
      expect(response.data?.stats).toBeDefined();
      expect(typeof response.data?.stats.total).toBe("number");
      expect(response.data?.stats.byStatus).toBeDefined();
      expect(response.data?.stats.byAssignee).toBeDefined();
    });

    it("should get task activity", async () => {
      if (!testTaskId) {
        throw new Error("No test task ID available");
      }

      const response = await api.getActivity(testTaskId);
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data?.activity)).toBe(true);
    });

    it("should delete the test task", async () => {
      if (!testTaskId) {
        throw new Error("No test task ID available");
      }

      const response = await api.remove(testTaskId);
      expect(response.success).toBe(true);
      expect(response.data?.message).toBe("Task deleted");

      // Verify it's gone
      const getResponse = await api.get(testTaskId);
      expect(getResponse.success).toBe(false);
      expect(getResponse.error).toContain("not found");
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for non-existent task", async () => {
      const fakeId = "non-existent-id-12345";
      const response = await api.get(fakeId);
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it("should validate required fields on creation", async () => {
      const response = await api.create({
        title: "", // Empty title should fail
      } as any);

      expect(response.success).toBe(false);
      expect(response.error).toContain("Title is required");
    });

    it("should validate status values", async () => {
      if (!testTaskId) {
        // Skip if no task to test with
        return;
      }

      const response = await api.updateStatus(testTaskId, "invalid_status" as any);
      expect(response.success).toBe(false);
      expect(response.error).toContain("Invalid status");
    });
  });

  describe("Response Format", () => {
    it("should return JSON with correct content-type", async () => {
      const response = await fetch(`${CONVEX_URL}/api/health`);
      expect(response.headers.get("content-type")).toContain("application/json");

      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });
});

// Run tests
if (import.meta.vitest) {
  import.meta.vitest;
}
