import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, KanbanSquare, Film, CalendarDays, Brain, Users, Monitor } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Overview" },
  { to: "/tasks", icon: KanbanSquare, label: "Tasks" },
  { to: "/content", icon: Film, label: "Content" },
  { to: "/calendar", icon: CalendarDays, label: "Calendar" },
  { to: "/memory", icon: Brain, label: "Memory" },
  { to: "/team", icon: Users, label: "Team" },
  { to: "/office", icon: Monitor, label: "Office" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 lg:w-56 flex flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 px-3 lg:px-5 border-b border-border">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
          <span className="font-mono text-sm font-bold text-primary-foreground">OC</span>
        </div>
        <div className="hidden lg:block">
          <h1 className="font-mono text-sm font-bold text-foreground">OpenClaw</h1>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Mission Control</p>
        </div>
      </div>
      <nav className="flex-1 py-4 space-y-1 px-2 lg:px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary card-glow"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="hidden lg:inline font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-3 lg:p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
          <span className="hidden lg:inline text-xs text-muted-foreground">System Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
