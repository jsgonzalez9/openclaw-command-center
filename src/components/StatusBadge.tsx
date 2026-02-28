import { Badge } from "@/components/ui/badge";

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, string> = {
    working: "bg-success/20 text-success border-success/30",
    idle: "bg-muted text-muted-foreground border-border",
    assigned: "bg-warning/20 text-warning border-warning/30",
    "in-progress": "bg-primary/20 text-primary border-primary/30",
    backlog: "bg-muted text-muted-foreground border-border",
    completed: "bg-success/20 text-success border-success/30",
    cron: "bg-primary/20 text-primary border-primary/30",
    scheduled: "bg-warning/20 text-warning border-warning/30",
  };

  return (
    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${config[status] || config.idle}`}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
