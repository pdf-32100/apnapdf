import { Link } from "react-router-dom";

export function Spinner({ className = "" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ink-mute">
      <Spinner className="h-7 w-7 text-clay-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-clay-50 text-2xl">🗂️</div>
      <h3 className="text-xl">{title}</h3>
      {text && <p className="max-w-sm text-sm text-ink-mute">{text}</p>}
      {action}
    </div>
  );
}

export function Alert({ kind = "error", children }) {
  const styles = {
    error: "bg-rose-50 text-rose-800 border-rose-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };
  if (!children) return null;
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[kind]}`} role="alert">
      {children}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, subtitle, center }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.18em] text-clay-600">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl leading-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-ink-soft">{subtitle}</p>}
    </div>
  );
}

// PrintWala logo mark (matches /public/favicon.svg)
export function LogoMark({ className = "h-9 w-9" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PrintWala">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M46 14 H66 A25 25 0 0 1 66 64 H59 V86 H46 Z M59 26 H66 A13 13 0 0 1 66 52 H59 Z"
        fill="currentColor"
      />
      <path
        d="M16 26 H41 L49 34 V77 a3 3 0 0 1 -3 3 H19 a3 3 0 0 1 -3 -3 Z"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M41 26 V34 H49 Z" fill="currentColor" fillOpacity="0.16" />
      <rect x="21" y="38" width="19" height="2.6" rx="1.3" fill="currentColor" />
      <rect x="21" y="43.5" width="19" height="2.6" rx="1.3" fill="currentColor" />
      <rect x="21" y="49" width="12" height="2.6" rx="1.3" fill="currentColor" />
      <rect x="21" y="60" width="24" height="3.6" rx="1" fill="#28abe2" />
      <rect x="21" y="65.5" width="24" height="3.6" rx="1" fill="#ec008c" />
      <rect x="21" y="71" width="24" height="3.6" rx="1" fill="#ffc20e" />
    </svg>
  );
}

// Wordmark "PrintWala" — Print (navy) + Wala (orange)
export function Wordmark({ className = "text-xl" }) {
  return (
    <span className={`font-sans font-extrabold leading-none tracking-tight ${className}`}>
      <span className="text-ink">Print</span>
      <span className="text-clay-500">Wala</span>
    </span>
  );
}

export function Logo({ className = "", markClass = "h-9 w-9 text-ink", textClass = "text-xl" }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markClass} />
      <Wordmark className={textClass} />
    </Link>
  );
}
