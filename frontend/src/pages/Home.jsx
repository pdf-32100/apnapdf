import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useContentBlock } from "../context/SiteContext.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import { SectionTitle, Spinner } from "../components/ui.jsx";

export default function Home() {
  const { value: home } = useContentBlock("home");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/services", { params: { featured: true } })
      .then((res) => setServices(res.data.services.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = home.stats || [];
  const steps = home.steps || [];
  const testimonials = home.testimonials || [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <span className="chip mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-moss-400" /> Trusted by 4,500+ locals
            </span>
            <h1 className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              {home.heroTitle || "Print, design & paperwork — sorted in a few clicks"}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              {home.heroSubtitle ||
                "Upload your files, tell us what you need, and pay online. We handle the rest."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/services" className="btn-primary text-base">
                {home.heroCta || "Browse services"}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
              <Link to="/about" className="btn-outline text-base">How it works</Link>
            </div>

            {stats.length > 0 && (
              <div className="mt-12 grid max-w-lg grid-cols-3 gap-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-2xl font-semibold text-ink sm:text-3xl">{s.value}</div>
                    <div className="mt-1 text-xs text-ink-mute sm:text-sm">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-clay-200/50 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-44 w-44 rounded-full bg-moss-100 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-ink/10 shadow-lift">
              <img
                src={home.heroImage || "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=1200&q=80"}
                alt="People getting things done"
                className="h-[420px] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl border border-ink/10 bg-paper px-4 py-3 shadow-lift">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-moss-100 text-lg">✅</span>
              <div>
                <p className="text-sm font-semibold">Order delivered</p>
                <p className="text-xs text-ink-mute">in under 2 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      {steps.length > 0 && (
        <section className="container-page py-14">
          <SectionTitle eyebrow="How it works" title="Four simple steps" center />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={i} className="card relative p-6">
                <span className="absolute right-5 top-4 font-display text-4xl font-semibold text-clay-100">
                  {i + 1}
                </span>
                <h3 className="text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-mute">{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured services */}
      <section className="container-page py-14">
        <div className="flex items-end justify-between gap-4">
          <SectionTitle eyebrow="Popular right now" title="Services people love" />
          <Link to="/services" className="hidden shrink-0 text-sm font-semibold text-clay-700 hover:text-clay-800 sm:inline-flex sm:items-center sm:gap-1">
            View all <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-7 w-7 text-clay-600" /></div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => <ServiceCard key={s.id} service={s} />)}
          </div>
        )}
        <div className="mt-8 text-center sm:hidden">
          <Link to="/services" className="btn-outline">View all services</Link>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-ink/[0.03] py-16">
          <div className="container-page">
            <SectionTitle eyebrow="Kind words" title="What customers say" center />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <figure key={i} className="card flex flex-col p-6">
                  <div className="mb-3 text-clay-400">★★★★★</div>
                  <blockquote className="flex-1 text-ink-soft">“{t.text}”</blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-clay-600 text-sm text-white">
                      {t.name?.[0]}
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-ink-mute">{t.role}</div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page py-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-14 text-center text-cream sm:px-16">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-clay-600/30 blur-3xl" />
          <h2 className="relative text-3xl sm:text-4xl">Ready when you are</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-cream/70">
            Skip the queue. Pick a service, upload your file and pay securely — we'll take it from here.
          </p>
          <Link to="/services" className="btn-primary relative mt-7 text-base">Get started now</Link>
        </div>
      </section>
    </div>
  );
}
