import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useContentBlock } from "../context/SiteContext.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import { SectionTitle, Spinner } from "../components/ui.jsx";

const CATEGORY_ICONS = {
  "printing & copy": "🖨️",
  documentation: "📑",
  design: "🎨",
  "government services": "🏛️",
};
const catIcon = (name = "") => CATEGORY_ICONS[name.toLowerCase()] || "🧾";

const FEATURES = [
  { icon: "⚡", title: "Lightning-fast turnaround", text: "Most orders are ready in under 2 hours — no more standing in queues." },
  { icon: "🔒", title: "Secure online payments", text: "Pay by UPI, card or netbanking. Every transaction is encrypted and safe." },
  { icon: "🚚", title: "Pickup or delivery", text: "Collect from the shop when it suits you, or get it delivered to your door." },
  { icon: "🎯", title: "Quality, guaranteed", text: "Not happy with a print? We'll redo it for free, no questions asked." },
];

const GALLERY = [
  "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1600793575654-910699b5e4d4?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1606636660801-c61b8e97a7b8?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?auto=format&fit=crop&w=600&q=80",
];

const FAQS = [
  { q: "What files can I upload?", a: "PDFs, images (JPG/PNG) and Word documents up to 20 MB. For the photocopy service, a PDF gives the sharpest result." },
  { q: "How long will my order take?", a: "Most everyday jobs — prints, photocopies, lamination — are ready in under 2 hours. Bigger design jobs are usually same-day." },
  { q: "How do I pay?", a: "Securely online at checkout via UPI, credit/debit card or netbanking. You'll get an order confirmation the moment payment succeeds." },
  { q: "Can I get my order delivered?", a: "Yes — choose delivery at checkout, or pick it up from the shop whenever you like. We'll message you the moment it's ready." },
  { q: "Is my data safe?", a: "Absolutely. Your files are used only to complete your order and are handled privately by our team." },
];

const TRUST_ITEMS = ["Students", "Startups", "Offices", "Schools", "Event planners", "Freelancers", "Local shops", "Job seekers"];

export default function Home() {
  const { value: home } = useContentBlock("home");
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    api
      .get("/services", { params: { featured: true } })
      .then((res) => setServices(res.data.services.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
    api.get("/services/categories").then((res) => setCategories(res.data.categories || [])).catch(() => {});
  }, []);

  const stats = home.stats?.length
    ? home.stats
    : [
        { value: "12,000+", label: "Orders delivered" },
        { value: "4,500+", label: "Happy customers" },
        { value: "2 hrs", label: "Avg. turnaround" },
      ];
  const steps = home.steps || [];
  const testimonials = home.testimonials || [];

  return (
    <div>
      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-clay-200/40 blur-3xl" />
          <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-cyan/10 blur-3xl" />
        </div>
        <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="rise-in">
            <span className="chip mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-moss-400" /> Trusted by 4,500+ locals
            </span>
            <h1 className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              {home.heroTitle || "Print, design & paperwork — sorted in a few clicks"}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              {home.heroSubtitle ||
                "Upload your files, tell us what you need, and pay online. We handle the rest and have it ready for you — no queues, no hassle."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/services" className="btn-primary text-base">
                {home.heroCta || "Browse services"}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
              <Link to="/about" className="btn-outline text-base">How it works</Link>
            </div>

            {/* rating + avatars trust row */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-2">
                {["A", "R", "P", "S", "K"].map((c, i) => (
                  <span key={i} className={`grid h-9 w-9 place-items-center rounded-full border-2 border-cream text-xs font-bold text-white ${["bg-clay-500","bg-ink","bg-cyan","bg-magenta","bg-moss-600"][i]}`}>{c}</span>
                ))}
              </div>
              <div>
                <div className="text-clay-400">★★★★★ <span className="font-semibold text-ink">4.9</span></div>
                <div className="text-xs text-ink-mute">from 2,300+ verified reviews</div>
              </div>
            </div>
          </div>

          <div className="relative rise-in">
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
            <div className="absolute -right-3 top-8 hidden items-center gap-2 rounded-2xl border border-ink/10 bg-paper px-3 py-2 shadow-lift sm:flex">
              <span className="flex gap-1">
                <span className="h-3 w-3 rounded-full bg-cyan" />
                <span className="h-3 w-3 rounded-full bg-magenta" />
                <span className="h-3 w-3 rounded-full bg-yellow" />
              </span>
              <span className="text-xs font-semibold">True CMYK colour</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Trust marquee ───────────── */}
      <section className="border-y border-ink/8 bg-paper/60 py-5">
        <p className="container-page mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-mute">
          Loved by people who get things done
        </p>
        <div className="marquee-mask overflow-hidden">
          <div className="animate-marquee flex w-max gap-10 pr-10">
            {[...TRUST_ITEMS, ...TRUST_ITEMS].map((t, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap text-lg font-semibold text-ink/70">
                <span className="h-1.5 w-1.5 rounded-full bg-clay-500" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Categories ───────────── */}
      {categories.length > 0 && (
        <section className="container-page py-16">
          <SectionTitle eyebrow="Explore" title="What can we help you with?" subtitle="From a single photocopy to a full design job — pick a category to get started." center />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link key={c.id} to={`/services?category=${c.slug}`} className="card group flex flex-col gap-3 p-6 transition hover:-translate-y-1 hover:shadow-lift">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-clay-50 text-2xl transition group-hover:bg-clay-100">{catIcon(c.name)}</span>
                <h3 className="text-lg leading-tight">{c.name}</h3>
                <p className="text-sm text-ink-mute">{c.count} {c.count === 1 ? "service" : "services"} available</p>
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-clay-700 transition group-hover:gap-2">
                  Explore <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ───────────── Featured services ───────────── */}
      <section className="container-page pb-4">
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

      {/* ───────────── Why choose us ───────────── */}
      <section className="container-page py-16">
        <SectionTitle eyebrow="Why PrintWala" title="The little print shop, reimagined online" subtitle="All the care of your trusted neighbourhood shop, with the ease of ordering from your phone." center />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-clay-50 text-xl">{f.icon}</span>
              <h3 className="mt-4 text-lg leading-snug">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-mute">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── How it works ───────────── */}
      {steps.length > 0 && (
        <section className="container-page py-16">
          <SectionTitle eyebrow="How it works" title="Four simple steps" center />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={i} className="card relative overflow-hidden p-6">
                <span className="absolute right-4 top-2 font-display text-5xl font-semibold text-clay-100">{i + 1}</span>
                <div className="relative">
                  <h3 className="text-lg">{s.title}</h3>
                  <p className="mt-2 text-sm text-ink-mute">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ───────────── Stats band ───────────── */}
      <section className="bg-ink py-16 text-cream">
        <div className="container-page">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-4xl font-semibold sm:text-5xl">{s.value}</div>
                <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-clay-500" />
                <div className="mt-3 text-sm text-cream/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Recent work gallery ───────────── */}
      <section className="container-page py-16">
        <SectionTitle eyebrow="Our work" title="A peek at what we print" subtitle="Crisp text, rich colour and clean finishing on everything we deliver." />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {GALLERY.map((src, i) => (
            <div key={i} className={`overflow-hidden rounded-2xl border border-ink/8 ${i === 0 ? "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2" : ""}`}>
              <img src={src} alt="Print sample" loading="lazy" className={`h-full w-full object-cover transition duration-500 hover:scale-105 ${i === 0 ? "aspect-square sm:aspect-auto" : "aspect-square"}`} />
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── Testimonials ───────────── */}
      {testimonials.length > 0 && (
        <section className="bg-ink/[0.03] py-16">
          <div className="container-page">
            <SectionTitle eyebrow="Kind words" title="What customers say" center />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <figure key={i} className="card flex flex-col p-6">
                  <svg className="mb-3 h-7 w-7 text-clay-200" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 7A5.5 5.5 0 004 12.5V17h5v-4H6.8A2.8 2.8 0 019.5 10zm9 0a5.5 5.5 0 00-5.5 5.5V17h5v-4h-2.2a2.8 2.8 0 012.7-3z"/></svg>
                  <blockquote className="flex-1 text-ink-soft">“{t.text}”</blockquote>
                  <div className="mt-3 text-sm text-clay-400">★★★★★</div>
                  <figcaption className="mt-3 flex items-center gap-3 border-t border-ink/8 pt-4">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-clay-600 text-sm text-white">{t.name?.[0]}</span>
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

      {/* ───────────── FAQ ───────────── */}
      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionTitle eyebrow="Good to know" title="Frequently asked questions" />
            <p className="mt-4 text-ink-soft">Still have a question? We're happy to help.</p>
            <Link to="/contact" className="btn-outline mt-5">Contact us</Link>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="card overflow-hidden">
                  <button onClick={() => setOpenFaq(open ? -1 : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                    <span className="font-semibold">{f.q}</span>
                    <svg className={`shrink-0 text-clay-600 transition ${open ? "rotate-45" : ""}`} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                  </button>
                  {open && <p className="px-5 pb-5 text-sm text-ink-soft">{f.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────── Final CTA ───────────── */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-16 text-center text-cream sm:px-16">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-clay-600/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-cyan/10 blur-3xl" />
          <div className="relative">
            <div className="mx-auto mb-5 flex justify-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan" />
              <span className="h-2.5 w-2.5 rounded-full bg-magenta" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow" />
            </div>
            <h2 className="text-3xl sm:text-4xl">Ready to print your ideas?</h2>
            <p className="mx-auto mt-3 max-w-lg text-cream/70">
              Skip the queue. Pick a service, upload your file and pay securely — we'll take it from here.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/services" className="btn-primary text-base">Get started now</Link>
              <Link to="/contact" className="btn-ghost border-cream/20 text-cream hover:bg-white/10 text-base">Talk to us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
