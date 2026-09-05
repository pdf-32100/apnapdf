import { useState } from "react";
import { Link } from "react-router-dom";

export default function AnnouncementBar() {
  const [show, setShow] = useState(() => {
    try {
      return localStorage.getItem("pw_hide_promo") !== "1";
    } catch {
      return true;
    }
  });

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem("pw_hide_promo", "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return (
    <div className="relative bg-ink text-cream">
      {/* CMYK accent line */}
      <div className="flex h-1 w-full">
        <div className="flex-1 bg-cyan" />
        <div className="flex-1 bg-magenta" />
        <div className="flex-1 bg-yellow" />
      </div>
      <div className="container-page flex items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-xs sm:text-sm">
        <span className="font-semibold">
          🎉 Flat <span className="text-clay-400">20% off</span> your first order — use code{" "}
          <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono font-semibold tracking-wide">HELLO20</span>
        </span>
        <Link to="/services" className="hidden font-semibold text-clay-400 underline-offset-2 hover:underline sm:inline">
          Order now →
        </Link>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-cream/60 hover:bg-white/10 hover:text-cream"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
