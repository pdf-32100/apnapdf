import { Link } from "react-router-dom";

// Shared layout + typography for legal pages (Terms, Privacy).
export default function LegalPage({ title, updated, intro, children }) {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-6 flex items-center gap-2 text-sm text-ink-mute">
          <Link to="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <span className="text-ink">{title}</span>
        </nav>

        <header className="border-b border-ink/8 pb-6">
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.18em] text-clay-600">
            Legal
          </span>
          <h1 className="text-4xl sm:text-5xl">{title}</h1>
          {updated && <p className="mt-3 text-sm text-ink-mute">Last updated: {updated}</p>}
          {intro && <p className="mt-4 text-ink-soft">{intro}</p>}
        </header>

        <article className="legal-prose mt-8">{children}</article>

        <div className="mt-12 rounded-xl2 border border-ink/8 bg-paper p-6 text-sm text-ink-soft shadow-soft">
          Questions about this page? <Link to="/contact" className="link-underline">Get in touch</Link> — we're happy to help.
        </div>
      </div>
    </div>
  );
}

// Small helpers for consistent section styling
export function Section({ n, title, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl sm:text-2xl">
        {n != null && <span className="mr-2 font-display text-clay-500">{n}.</span>}
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-ink-soft">{children}</div>
    </section>
  );
}
