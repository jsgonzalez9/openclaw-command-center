import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { mockTasks, mockAgents, mockEvents, mockMemories } from "@/data/mock-data";
import { Activity, Brain, CheckCircle2, Clock, KanbanSquare, Users } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent?: string }) => (
  <div className="rounded-lg border border-border bg-card p-4 card-glow animate-slide-in">
    <div className="flex items-center gap-3">
      <div className={`rounded-md p-2 ${accent || "bg-primary/10"}`}>
        <Icon className={`h-4 w-4 ${accent ? "text-foreground" : "text-primary"}`} />
      </div>
      <div>
        <p className="text-2xl font-mono font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </div>
);

const Index = () => {
  const activeAgents = mockAgents.filter((a) => a.status === "working").length;
  const inProgress = mockTasks.filter((t) => t.status === "in-progress").length;
  const completed = mockTasks.filter((t) => t.status === "completed").length;

  return (
    <DashboardLayout>
      <PageHeader title="Mission Control" subtitle="OpenClaw Autonomous Agent System — All systems operational" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Active Agents" value={activeAgents} />
        <StatCard icon={KanbanSquare} label="In Progress" value={inProgress} />
        <StatCard icon={CheckCircle2} label="Completed" value={completed} />
        <StatCard icon={Brain} label="Memories" value={mockMemories.length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-mono text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Recent Activity
          </h2>
          <div className="space-y-3">
            {mockTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.assignedTo}</p>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-mono text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Upcoming Events
          </h2>
          <div className="space-y-3">
            {mockEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date} at {event.time} — {event.agent}</p>
                </div>
                <StatusBadge status={event.type} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
