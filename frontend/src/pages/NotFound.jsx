import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="font-display text-7xl font-semibold text-clay-300">404</div>
      <h1 className="mt-4 text-3xl">We couldn't find that page</h1>
      <p className="mt-2 max-w-sm text-ink-soft">
        The page you're looking for may have moved, or the link might be broken.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn-outline">Go home</Link>
        <Link to="/services" className="btn-primary">Browse services</Link>
      </div>
    </div>
  );
}
