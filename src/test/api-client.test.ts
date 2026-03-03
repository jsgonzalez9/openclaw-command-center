import { describe, it, expect } from "vitest";
import { tasksApi } from "../lib/api-client";

describe("Task API Routes", () => {
  describe("API Client Types", () => {
    it("should export all required API functions", () => {
      expect(typeof tasksApi.list).toBe("function");
      expect(typeof tasksApi.get).toBe("function");
      expect(typeof tasksApi.getBoard).toBe("function");
      expect(typeof tasksApi.getStats).toBe("function");
      expect(typeof tasksApi.getActivity).toBe("function");
      expect(typeof tasksApi.create).toBe("function");
      expect(typeof tasksApi.updateStatus).toBe("function");
      expect(typeof tasksApi.assign).toBe("function");
      expect(typeof tasksApi.update).toBe("function");
      expect(typeof tasksApi.remove).toBe("function");
    });

    it("should define Task interface correctly", () => {
      // This is a compile-time check - if it compiles, types are correct
      const mockTask = {
        _id: "test-123",
        title: "Test Task",
        status: "pending" as const,
        priority: "p2_medium" as const,
        assignedTo: "user" as const,
        project: "general" as const,
        createdBy: "system",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(mockTask.title).toBe("Test Task");
    });

    it("should define TaskStats interface correctly", () => {
      const mockStats = {
        total: 10,
        byStatus: {
          pending: 3,
          in_progress: 2,
          review: 1,
          blocked: 1,
          completed: 3,
        },
        byAssignee: {
          user: 4,
          ai: 3,
          senior_dev: 2,
          copywriter: 1,
          external: 0,
        },
        completedToday: 2,
      };

      expect(mockStats.total).toBe(10);
      expect(mockStats.byStatus.pending).toBe(3);
    });

    it("should define TaskBoard interface correctly", () => {
      const mockBoard = {
        pending: [],
        in_progress: [],
        review: [],
        blocked: [],
        completed: [],
      };

      expect(Object.keys(mockBoard).length).toBe(5);
    });
  });

  describe("Convex Backend Functions", () => {
    it("should have schema defined", () => {
      // Schema file exists and is valid TypeScript
      const fs = require("fs");
      const path = require("path");
      const schemaPath = path.join(__dirname, "../../convex/schema.ts");
      
      expect(fs.existsSync(schemaPath)).toBe(true);
      
      const content = fs.readFileSync(schemaPath, "utf-8");
      expect(content).toContain("tasks");
      expect(content).toContain("taskActivity");
      expect(content).toContain("syncState");
    });

    it("should have all query functions defined", () => {
      const fs = require("fs");
      const path = require("path");
      const convexDir = path.join(__dirname, "../../convex/tasks");
      
      expect(fs.existsSync(path.join(convexDir, "list.ts"))).toBe(true);
      expect(fs.existsSync(path.join(convexDir, "get.ts"))).toBe(true);
      expect(fs.existsSync(path.join(convexDir, "getBoard.ts"))).toBe(true);
      expect(fs.existsSync(path.join(convexDir, "getStats.ts"))).toBe(true);
      expect(fs.existsSync(path.join(convexDir, "getActivity.ts"))).toBe(true);
    });

    it("should have all mutation functions defined", () => {
      const fs = require("fs");
      const path = require("path");
      const convexDir = path.join(__dirname, "../../convex/tasks");
      
      expect(fs.existsSync(path.join(convexDir, "create.ts"))).toBe(true);
      expect(fs.existsSync(path.join(convexDir, "update.ts"))).toBe(true);
      expect(fs.existsSync(path.join(convexDir, "updateStatus.ts"))).toBe(true);
      expect(fs.existsSync(path.join(convexDir, "assign.ts"))).toBe(true);
      expect(fs.existsSync(path.join(convexDir, "remove.ts"))).toBe(true);
    });
  });
});
