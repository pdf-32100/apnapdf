import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Logo } from "./ui.jsx";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();

  const doLogout = () => {
    logout();
    setMenu(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-cream/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-ink text-cream" : "text-ink-soft hover:bg-ink/5"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                className="flex items-center gap-2 rounded-full border border-ink/10 bg-paper py-1.5 pl-1.5 pr-3 text-sm font-semibold shadow-soft transition hover:shadow-lift"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-clay-600 text-xs text-white">
                  {user.name?.[0]?.toUpperCase()}
                </span>
                <span className="max-w-[8rem] truncate">{user.name.split(" ")[0]}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" className="text-ink-mute"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
              </button>
              {menu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-ink/10 bg-paper p-1.5 shadow-lift">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-ink-mute">{user.email}</p>
                    </div>
                    <div className="my-1 h-px bg-ink/8" />
                    <MenuItem to="/orders" onClick={() => setMenu(false)}>My orders</MenuItem>
                    {isAdmin && (
                      <MenuItem to="/admin" onClick={() => setMenu(false)}>Admin panel</MenuItem>
                    )}
                    <button
                      onClick={doLogout}
                      className="mt-0.5 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Log in</Link>
              <Link to="/services" className="btn-primary">Get started</Link>
            </>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-ink/10 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-ink/8 bg-cream md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive ? "bg-ink text-cream" : "hover:bg-ink/5"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="my-1 h-px bg-ink/8" />
            {user ? (
              <>
                <NavLink to="/orders" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-ink/5">My orders</NavLink>
                {isAdmin && <NavLink to="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-ink/5">Admin panel</NavLink>}
                <button onClick={doLogout} className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50">Log out</button>
              </>
            ) : (
              <div className="flex gap-2 px-1 py-1">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-outline flex-1">Log in</Link>
                <Link to="/services" onClick={() => setOpen(false)} className="btn-primary flex-1">Get started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuItem({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-ink/5">
      {children}
    </Link>
  );
}
