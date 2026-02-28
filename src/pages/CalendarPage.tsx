import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { mockEvents } from "@/data/mock-data";
import { Clock, Repeat } from "lucide-react";

const CalendarPage = () => {
  // Group events by date
  const grouped = mockEvents.reduce<Record<string, typeof mockEvents>>((acc, ev) => {
    (acc[ev.date] = acc[ev.date] || []).push(ev);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <DashboardLayout>
      <PageHeader title="Calendar & Scheduling" subtitle="All scheduled tasks, cron jobs, and automated activities" />
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="animate-slide-in">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h3>
            <div className="space-y-2">
              {grouped[date].sort((a, b) => a.time.localeCompare(b.time)).map((event) => (
                <div key={event.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 card-glow hover:border-primary/30 transition-colors">
                  <div className="text-center min-w-[50px]">
                    <span className="font-mono text-lg font-bold text-foreground">{event.time}</span>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {event.type === "cron" ? <Repeat className="h-3 w-3 text-primary" /> : <Clock className="h-3 w-3 text-warning" />}
                      <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.agent}</p>
                  </div>
                  <StatusBadge status={event.type} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage;
