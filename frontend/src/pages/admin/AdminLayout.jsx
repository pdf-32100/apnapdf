import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Brand } from "../../components/ui.jsx";

const nav = [
  { to: "/admin", label: "Dashboard", icon: "📊", end: true },
  { to: "/admin/services", label: "Services", icon: "🧾" },
  { to: "/admin/orders", label: "Orders", icon: "📦" },
  { to: "/admin/content", label: "Site content", icon: "✏️" },
  { to: "/admin/messages", label: "Messages", icon: "💬" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const doLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarInner = () => (
    <>
      <Link to="/" className="flex items-center px-2 py-1">
        <Brand dark size="sm" sub="Admin panel" />
      </Link>
      <nav className="mt-6 flex flex-col gap-1">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive ? "bg-clay-600 text-white" : "text-cream/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <span>{n.icon}</span> {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
          <p className="truncate text-xs text-cream/50">{user?.email}</p>
        </div>
        <div className="mt-2 flex gap-2">
          <Link to="/" className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-center text-xs font-semibold text-cream/70 hover:text-white">
            View site
          </Link>
          <button onClick={doLogout} className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/10">
            Log out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink p-4 lg:flex">
        <SidebarInner />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ink/8 bg-ink px-4 py-3 lg:hidden">
        <Brand dark size="xs" />
        <button onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-ink p-4">
            <SidebarInner />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
