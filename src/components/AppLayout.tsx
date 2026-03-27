import { ReactNode, useState } from "react";
import { TopNavbar } from "@/components/TopNavbar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { Menu } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <TopNavbar />
      <div className="flex flex-1">
        <AppSidebar />
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="flex-1 flex flex-col">
          <div className="md:hidden flex items-center px-4 py-2 border-b border-border">
            <button onClick={() => setMobileOpen(true)} className="text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
