import {
  LayoutDashboard,
  Briefcase,
  ShieldAlert,
  Bot,
  Settings,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { title: "Dashboard", to: "/", icon: LayoutDashboard },
  { title: "Portfolio", to: "/portfolio", icon: Briefcase },
  { title: "Risk", to: "/risk", icon: ShieldAlert },
  { title: "AI Copilot", to: "/copilot", icon: Bot },
  { title: "Settings", to: "/settings", icon: Settings },
];

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden" onClick={onClose} />
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-sidebar p-4 md:hidden animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-bold gradient-text">Boma-Insight AI</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
