import { Link, useLocation } from "react-router-dom";
import { Code2, LayoutDashboard, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

export function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { to: "/", label: "Analyze", icon: Code2 },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Code<span className="text-primary">Mentor</span> AI
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <Button
                variant={location.pathname === to ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2",
                  location.pathname === to && "bg-secondary"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="ml-2">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </nav>
      </div>
    </header>
  );
}
