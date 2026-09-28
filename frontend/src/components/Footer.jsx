import { Link } from "react-router-dom";
import { useSite } from "../context/SiteContext.jsx";
import { Brand } from "./ui.jsx";

export default function Footer() {
  const { settings } = useSite();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-ink/8 bg-ink text-cream">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-2">
          <Brand dark size="sm" />
          <p className="mt-3 max-w-xs text-sm text-cream/60">{settings.tagline}</p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-cream/50">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
            <li><Link to="/services" className="hover:text-white">All services</Link></li>
            <li><Link to="/about" className="hover:text-white">About us</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/orders" className="hover:text-white">Track an order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-cream/50">Legal</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
            <li><Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-cream/50">Reach us</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
            {settings.phone && <li>📞 {settings.phone}</li>}
            {settings.email && <li>✉️ {settings.email}</li>}
            {settings.hours && <li>🕑 {settings.hours}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-cream/50 sm:flex-row">
          <p>© {year} {settings.siteName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-cream">Terms</Link>
            <Link to="/privacy" className="hover:text-cream">Privacy</Link>
            <span>Secure payments by Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
