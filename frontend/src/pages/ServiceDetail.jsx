import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client.js";
import Img from "../components/Img.jsx";
import { FALLBACK } from "../lib/images.js";
import { formatINR } from "../lib/format.js";
import { PageLoader } from "../components/ui.jsx";
import NotFound from "./NotFound.jsx";

export default function ServiceDetail() {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/services/${slug}`)
      .then((res) => setService(res.data.service))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageLoader />;
  if (error || !service) return <NotFound />;

  const perks = [
    { icon: "⚡", label: "Fast turnaround" },
    { icon: "🔒", label: "Secure online payment" },
    { icon: "🎯", label: "Quality guaranteed" },
  ];

  return (
    <div className="container-page py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-ink-mute">
        <Link to="/services" className="hover:text-ink">Services</Link>
        <span>/</span>
        {service.category && <><span>{service.category.name}</span><span>/</span></>}
        <span className="text-ink">{service.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="overflow-hidden rounded-[1.5rem] border border-ink/10 shadow-soft">
            <Img
              src={service.imageUrl}
              fallback={FALLBACK.service}
              alt={service.title}
              width={1200}
              height={680}
              widths={[640, 960, 1280, 1600]}
              sizes="(min-width: 1024px) 55vw, 100vw"
              loading="eager"
              className="h-[340px] w-full object-cover"
            />
          </div>

          <div className="mt-8">
            <h2 className="text-2xl">About this service</h2>
            <div className="mt-3 space-y-3 text-ink-soft">
              {service.description.split("\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          {Array.isArray(service.fields) && service.fields.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl">What we'll ask you</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {service.fields.map((f) => (
                  <li key={f.name} className="flex items-center gap-2 rounded-xl border border-ink/8 bg-paper px-4 py-2.5 text-sm">
                    <span className="text-moss-600">▸</span>
                    <span className="font-medium">{f.label}</span>
                    {f.required && <span className="text-xs text-clay-600">required</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sticky booking card */}
        <div>
          <div className="sticky top-24 card p-6">
            {service.category && (
              <span className="chip mb-3">{service.category.name}</span>
            )}
            <h1 className="text-3xl leading-tight">{service.title}</h1>
            <p className="mt-2 text-ink-soft">{service.shortDesc}</p>

            <div className="mt-6 flex items-end gap-2 border-y border-ink/8 py-5">
              <span className="text-sm text-ink-mute">Starting at</span>
              <span className="font-display text-4xl font-semibold text-ink">{formatINR(service.price)}</span>
              <span className="pb-1 text-sm text-ink-mute">/ unit</span>
            </div>

            {service.requiresUpload && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-clay-50 px-4 py-3 text-sm text-clay-800">
                <span>⤴</span>
                <span>You'll upload your file on the next step — {service.uploadLabel?.toLowerCase() || "attach your document"}.</span>
              </div>
            )}

            <Link to={`/services/${service.slug}/book`} className="btn-primary mt-5 w-full text-base">
              Book this service
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>

            <ul className="mt-6 space-y-2.5">
              {perks.map((p) => (
                <li key={p.label} className="flex items-center gap-2.5 text-sm text-ink-soft">
                  <span>{p.icon}</span> {p.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
