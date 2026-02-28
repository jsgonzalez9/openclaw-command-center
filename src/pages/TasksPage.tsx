import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { mockTasks } from "@/data/mock-data";
import { User, Bot } from "lucide-react";

const columns = [
  { key: "backlog" as const, label: "Backlog" },
  { key: "in-progress" as const, label: "In Progress" },
  { key: "completed" as const, label: "Completed" },
];

const TasksPage = () => {
  return (
    <DashboardLayout>
      <PageHeader title="Tasks Board" subtitle="Kanban view of all human and AI work" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((col) => {
          const tasks = mockTasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</h3>
                <span className="text-xs font-mono text-muted-foreground">{tasks.length}</span>
              </div>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="rounded-lg border border-border bg-card p-4 card-glow animate-slide-in hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-foreground leading-tight">{task.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {task.assignedTo === "Human" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3 text-primary" />}
                        <span>{task.assignedTo}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(task.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default TasksPage;
