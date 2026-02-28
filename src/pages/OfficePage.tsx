import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { mockAgents } from "@/data/mock-data";
import { Code, PenTool, Palette, Shield, Monitor } from "lucide-react";

const roleIcons: Record<string, any> = {
  Developer: Code,
  Writer: PenTool,
  Designer: Palette,
  System: Shield,
};

const OfficePage = () => {
  return (
    <DashboardLayout>
      <PageHeader title="Digital Office" subtitle="Live visualization of agent workstations and activity" />
      <div className="rounded-lg border border-border bg-card p-8 min-h-[500px] relative overflow-hidden">
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "linear-gradient(hsl(190 100% 50% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(190 100% 50% / 0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8">
          {mockAgents.map((agent) => {
            const Icon = roleIcons[agent.role] || Shield;
            const isWorking = agent.status === "working";

            return (
              <div key={agent.id} className="flex flex-col items-center animate-slide-in group">
                {/* Workstation */}
                <div className={`relative rounded-xl border p-6 w-full text-center transition-all duration-300 ${
                  isWorking
                    ? "border-primary/40 bg-primary/5 glow-primary"
                    : "border-border bg-muted/30"
                } group-hover:border-primary/50 group-hover:bg-primary/10`}>
                  {/* Status indicator */}
                  <div className={`absolute top-3 right-3 h-2.5 w-2.5 rounded-full ${
                    isWorking ? "bg-success animate-pulse-glow" : "bg-muted-foreground/40"
                  }`} />

                  {/* Agent avatar */}
                  <div className={`mx-auto mb-3 rounded-full p-4 w-fit ${
                    isWorking ? "bg-primary/20" : "bg-muted"
                  }`}>
                    <Icon className={`h-8 w-8 ${isWorking ? "text-primary" : "text-muted-foreground"}`} />
                  </div>

                  {/* Agent info */}
                  <h3 className="font-mono text-sm font-bold text-foreground">{agent.name}</h3>
                  <p className="text-[10px] text-primary font-mono uppercase tracking-widest mt-0.5">{agent.role}</p>

                  {/* Monitor icon */}
                  <Monitor className={`mx-auto mt-3 h-5 w-5 ${isWorking ? "text-primary/60" : "text-muted-foreground/30"}`} />

                  {/* Current task */}
                  {agent.currentTask && (
                    <div className="mt-3 rounded bg-background/50 px-2 py-1.5">
                      <p className="text-[10px] text-muted-foreground leading-tight">{agent.currentTask}</p>
                    </div>
                  )}
                  {!agent.currentTask && (
                    <div className="mt-3 px-2 py-1.5">
                      <p className="text-[10px] text-muted-foreground/50 italic">Idle</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OfficePage;
