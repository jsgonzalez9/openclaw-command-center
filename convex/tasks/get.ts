import { query } from "./_generated/server";
import { v } from "convex/values";

export default query({
  args: {
    id: v.id("tasks"),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
