import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client.js";
import ServiceCard from "../components/ServiceCard.jsx";
import { EmptyState, Spinner } from "../components/ui.jsx";

export default function Services() {
  const [params, setParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get("q") || "");

  const activeCat = params.get("category") || "";

  useEffect(() => {
    api.get("/services/categories").then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/services", { params: { category: activeCat || undefined, q: params.get("q") || undefined } })
      .then((res) => setServices(res.data.services))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [activeCat, params]);

  const submitSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (q) next.set("q", q);
    else next.delete("q");
    setParams(next);
  };

  const setCategory = (slug) => {
    const next = new URLSearchParams(params);
    if (slug) next.set("category", slug);
    else next.delete("category");
    setParams(next);
  };

  return (
    <div className="container-page py-12">
      <header className="max-w-2xl">
        <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.18em] text-clay-600">
          Our services
        </span>
        <h1 className="text-4xl sm:text-5xl">Everything you need, in one place</h1>
        <p className="mt-3 text-ink-soft">
          Browse services, pick one and book in minutes. Upload files where needed and pay securely online.
        </p>
      </header>

      {/* Controls */}
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <CatButton active={!activeCat} onClick={() => setCategory("")}>All</CatButton>
          {categories.map((c) => (
            <CatButton key={c.id} active={activeCat === c.slug} onClick={() => setCategory(c.slug)}>
              {c.name} <span className="ml-1 text-ink-mute">{c.count}</span>
            </CatButton>
          ))}
        </div>
        <form onSubmit={submitSearch} className="relative w-full max-w-xs">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search services…"
            className="input pl-10"
          />
          <svg className="absolute left-3.5 top-3 text-ink-mute" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
        </form>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-24"><Spinner className="h-8 w-8 text-clay-600" /></div>
      ) : services.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No services found" text="Try a different category or search term." />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>
      )}
    </div>
  );
}

function CatButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active ? "border-ink bg-ink text-cream" : "border-ink/12 bg-paper text-ink-soft hover:border-ink/30"
      }`}
    >
      {children}
    </button>
  );
}
