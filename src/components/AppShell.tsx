import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { EtherLogo } from "@/components/EtherLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface NavItem { to: string; label: string; }

export function AppShell({ children, nav }: { children: ReactNode; nav: NavItem[] }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const out = () => {
    signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-dvh bg-background relative">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[300px] pulse-bg pointer-events-none opacity-60" />
      <header className="relative z-20 border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <EtherLogo to={user?.role === "admin" ? "/admin" : "/dashboard"} />
            <nav className="hidden md:flex items-center gap-1">
              {nav.map((n) => {
                const active = pathname === n.to;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end leading-tight mr-2">
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{user?.role}</span>
            </div>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={out} className="rounded-full bg-transparent border-border gap-2">
              <LogOut className="size-3.5" /> <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
        <nav className="md:hidden border-t border-border px-4 py-2 flex items-center gap-1 overflow-x-auto">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${active ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8">{children}</main>
    </div>
  );
}
