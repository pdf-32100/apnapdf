import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { formatINR, formatDate, STATUS_STYLES, statusLabel } from "../lib/format.js";
import { EmptyState, Spinner } from "../components/ui.jsx";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/mine/list")
      .then((res) => setOrders(res.data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-12">
      <h1 className="text-4xl">My orders</h1>
      <p className="mt-2 text-ink-soft">Track everything you've booked with us.</p>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner className="h-8 w-8 text-clay-600" /></div>
      ) : orders.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No orders yet"
            text="When you book a service it'll show up here."
            action={<Link to="/services" className="btn-primary mt-2">Browse services</Link>}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => (
            <Link key={o.id} to={`/order/${o.id}`}
              className="card flex flex-col gap-4 p-5 transition hover:shadow-lift sm:flex-row sm:items-center">
              {o.service?.imageUrl && (
                <img src={o.service.imageUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-semibold">{o.service?.title}</p>
                  <span className={`badge ${STATUS_STYLES[o.status]}`}>{statusLabel(o.status)}</span>
                </div>
                <p className="mt-1 text-sm text-ink-mute">
                  {o.number} · placed {formatDate(o.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-semibold">{formatINR(o.amount)}</p>
                <span className="text-sm font-semibold text-clay-700">View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
