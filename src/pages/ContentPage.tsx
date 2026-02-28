import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { mockContent } from "@/data/mock-data";
import { Lightbulb, PenTool, Image, Video, CheckCircle } from "lucide-react";

const stages = [
  { key: "ideas" as const, label: "Ideas", icon: Lightbulb },
  { key: "script-writing" as const, label: "Script Writing", icon: PenTool },
  { key: "thumbnail" as const, label: "Thumbnail", icon: Image },
  { key: "filming" as const, label: "Filming", icon: Video },
  { key: "published" as const, label: "Published", icon: CheckCircle },
];

const ContentPage = () => {
  return (
    <DashboardLayout>
      <PageHeader title="Content Pipeline" subtitle="Track content from idea to publication" />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const items = mockContent.filter((c) => c.stage === stage.key);
          return (
            <div key={stage.key} className="min-w-[260px] flex-1 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <stage.icon className="h-4 w-4 text-primary" />
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stage.label}</h3>
                <span className="ml-auto text-xs font-mono text-muted-foreground">{items.length}</span>
              </div>
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-card p-4 card-glow animate-slide-in hover:border-primary/30 transition-colors">
                  <h4 className="text-sm font-medium text-foreground mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                  {item.script && (
                    <div className="rounded bg-muted p-2 mb-2">
                      <p className="text-xs text-muted-foreground font-mono line-clamp-2">{item.script}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground">{item.assignedTo}</p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default ContentPage;
