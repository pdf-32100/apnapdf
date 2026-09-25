import { Link } from "react-router-dom";
import { formatINR } from "../lib/format.js";
import { FALLBACK } from "../lib/images.js";
import Img from "./Img.jsx";

export default function ServiceCard({ service }) {
  return (
    <Link
      to={`/services/${service.slug}`}
      className="card group flex flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-clay-50">
        <Img
          src={service.imageUrl}
          fallback={FALLBACK.service}
          alt={service.title}
          width={640}
          height={480}
          widths={[320, 480, 640, 960]}
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {service.category && (
          <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-xs font-semibold text-ink backdrop-blur">
            {service.category.name}
          </span>
        )}
        {service.requiresUpload && (
          <span className="absolute right-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-semibold text-cream backdrop-blur">
            ⤴ Upload
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg leading-snug">{service.title}</h3>
        <p className="mt-1.5 flex-1 text-sm text-ink-mute line-clamp-2">{service.shortDesc}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-ink-mute">
            from <span className="font-display text-lg font-semibold text-ink">{formatINR(service.price)}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-clay-700 transition group-hover:gap-2">
            Book now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
