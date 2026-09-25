import { Link } from "react-router-dom";
import { useContentBlock } from "../context/SiteContext.jsx";
import Img from "../components/Img.jsx";
import { FALLBACK } from "../lib/images.js";
import { PageLoader } from "../components/ui.jsx";

export default function About() {
  const { value: about, loading } = useContentBlock("about");
  if (loading) return <PageLoader />;

  const values = about.values || [];

  return (
    <div>
      <section className="container-page py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.18em] text-clay-600">
              About us
            </span>
            <h1 className="text-4xl leading-tight sm:text-5xl">{about.title || "About us"}</h1>
            <p className="mt-4 text-lg text-ink-soft">{about.subtitle}</p>
            <div className="mt-6 space-y-4 text-ink-soft">
              {(about.body || "").split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <Link to="/services" className="btn-primary mt-8">Explore our services</Link>
          </div>
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-40 w-40 rounded-full bg-moss-100 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-ink/10 shadow-lift">
              <Img
                src={about.image}
                fallback={FALLBACK.about}
                alt="Our team"
                width={1000}
                height={840}
                widths={[600, 900, 1200]}
                sizes="(min-width: 768px) 45vw, 100vw"
                loading="eager"
                className="h-[420px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {values.length > 0 && (
        <section className="bg-ink/[0.03] py-16">
          <div className="container-page">
            <h2 className="text-center text-3xl sm:text-4xl">What we stand for</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {values.map((v, i) => (
                <div key={i} className="card p-7 text-center">
                  <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-clay-50 text-xl">
                    {["🚀", "💰", "🤝"][i % 3]}
                  </div>
                  <h3 className="text-lg">{v.title}</h3>
                  <p className="mt-2 text-sm text-ink-mute">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
