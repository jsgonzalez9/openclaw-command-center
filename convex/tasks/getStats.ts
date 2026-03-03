import { query } from "./_generated/server";
import { v } from "convex/values";

export default query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);

    // Calculate stats
    const byStatus = {
      pending: 0,
      in_progress: 0,
      review: 0,
      blocked: 0,
      completed: 0,
    };

    const byAssignee = {
      user: 0,
      ai: 0,
      senior_dev: 0,
      copywriter: 0,
      external: 0,
    };

    let completedToday = 0;

    for (const task of tasks) {
      // Count by status
      if (task.status in byStatus) {
        byStatus[task.status as keyof typeof byStatus]++;
      }

      // Count by assignee
      if (task.assignedTo in byAssignee) {
        byAssignee[task.assignedTo as keyof typeof byAssignee]++;
      }

      // Count completed today
      if (task.status === "completed" && task.completedAt && task.completedAt >= todayStart) {
        completedToday++;
      }
    }

    return {
      total: tasks.length,
      byStatus,
      byAssignee,
      completedToday,
    };
  },
});
