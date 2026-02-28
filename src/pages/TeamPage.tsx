import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { mockAgents } from "@/data/mock-data";
import { Code, PenTool, Palette, Shield } from "lucide-react";

const roleIcons: Record<string, any> = {
  Developer: Code,
  Writer: PenTool,
  Designer: Palette,
  System: Shield,
};

const TeamPage = () => {
  return (
    <DashboardLayout>
      <PageHeader title="Team Structure" subtitle="Organizational hierarchy of the OpenClaw agent system" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockAgents.map((agent) => {
          const Icon = roleIcons[agent.role] || Shield;
          return (
            <div key={agent.id} className="rounded-lg border border-border bg-card p-5 card-glow animate-slide-in hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3 flex-shrink-0">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-mono text-base font-bold text-foreground">{agent.name}</h3>
                    <StatusBadge status={agent.status} />
                  </div>
                  <p className="text-xs text-primary font-mono uppercase tracking-wider mb-3">{agent.role}</p>
                  {agent.currentTask && (
                    <div className="rounded bg-muted px-3 py-2 mb-3">
                      <p className="text-xs text-muted-foreground">
                        <span className="text-foreground font-medium">Current: </span>
                        {agent.currentTask}
                      </p>
                    </div>
                  )}
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Responsibilities</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.responsibilities.map((r) => (
                        <span key={r} className="text-[10px] rounded bg-secondary px-2 py-0.5 text-secondary-foreground">{r}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Memory Scope</p>
                    <p className="text-xs text-muted-foreground">{agent.memoryScope}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default TeamPage;
