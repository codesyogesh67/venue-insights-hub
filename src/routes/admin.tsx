"use client";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, FilePlus, LogOut, Settings,
} from "lucide-react";
import { isAdmin, getAdminEmail, adminLogout } from "@/lib/clientStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/clients/new", label: "New Report", icon: FilePlus },
];

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setReady(true);
      return;
    }
    if (!isAdmin()) {
      navigate({ to: "/admin/login" });
      return;
    }
    setEmail(getAdminEmail());
    setReady(true);
  }, [pathname, navigate]);

  if (!ready) return <div className="min-h-screen bg-bg" />;
  if (pathname === "/admin/login") return <Outlet />;

  return (
    <div className="min-h-screen flex bg-bg text-foreground">
      <aside className="w-60 shrink-0 bg-surface border-r border-accent-vq flex flex-col">
        <div className="p-5 border-b border-accent-vq">
          <Link to="/" className="font-mono-vq font-bold tracking-wider text-lg">
            Venue<span className="text-accent-vq">IQ</span>
          </Link>
          <div className="text-[10px] font-mono-vq text-muted-vq uppercase mt-1">Admin Console</div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm",
                  active ? "bg-[rgba(201,151,58,0.18)] text-accent-bright" : "text-foreground/80 hover:bg-surface2",
                )}
              >
                <Icon size={15} /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-accent-vq space-y-1 text-xs">
          <div className="px-3 py-2 text-muted-vq truncate" title={email ?? ""}>{email}</div>
          <button
            onClick={() => {
              adminLogout();
              navigate({ to: "/admin/login" });
            }}
            className="flex items-center gap-2 px-3 py-2 w-full rounded-md hover:bg-surface2 text-foreground/80"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
