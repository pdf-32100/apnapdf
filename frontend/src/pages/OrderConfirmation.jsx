import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client.js";
import { formatINR, formatDateTime, STATUS_STYLES, statusLabel } from "../lib/format.js";
import { PageLoader } from "../components/ui.jsx";
import NotFound from "./NotFound.jsx";

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader label="Loading your order…" />;
  if (error || !order) return <NotFound />;

  const paid = ["PAID", "PROCESSING", "COMPLETED"].includes(order.status);
  const details = order.details || {};
  const detailEntries = Object.entries(details).filter(([k]) => k !== "quantity");

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl">
        {/* Status banner */}
        <div className="card overflow-hidden">
          <div className={`px-7 py-8 text-center ${paid ? "bg-moss-100" : "bg-amber-50"}`}>
            <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-paper text-3xl shadow-soft">
              {paid ? "🎉" : "⏳"}
            </div>
            <h1 className="text-3xl">{paid ? "Order confirmed!" : "Order received"}</h1>
            <p className="mt-2 text-ink-soft">
              {paid
                ? "Thank you! Your payment was successful and we've started processing your order."
                : "Your order is awaiting payment."}
            </p>
          </div>

          <div className="p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-mute">Order number</p>
                <p className="font-display text-xl font-semibold">{order.number}</p>
              </div>
              <span className={`badge ${STATUS_STYLES[order.status]}`}>{statusLabel(order.status)}</span>
            </div>

            <div className="my-6 h-px bg-ink/8" />

            {/* Service */}
            <div className="flex items-center gap-4">
              {order.service?.imageUrl && (
                <img src={order.service.imageUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{order.service?.title}</p>
                <p className="text-sm text-ink-mute">Quantity: {details.quantity || 1}</p>
              </div>
              <p className="font-display text-xl font-semibold">{formatINR(order.amount)}</p>
            </div>

            {/* Details */}
            {detailEntries.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-mute">Your requirements</h3>
                <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {detailEntries.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-ink/6 py-1.5 text-sm">
                      <dt className="capitalize text-ink-mute">{prettyKey(k)}</dt>
                      <dd className="text-right font-medium">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* File */}
            {order.fileUrl && (
              <div className="mt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink-mute">Uploaded file</h3>
                <a href={order.fileUrl} target="_blank" rel="noreferrer"
                  className="mt-3 flex items-center gap-3 rounded-xl border border-ink/10 bg-cream/60 px-4 py-3 transition hover:border-clay-400">
                  <span className="text-2xl">📄</span>
                  <span className="flex-1 truncate text-sm font-medium">{order.fileName || "Download file"}</span>
                  <span className="text-sm font-semibold text-clay-700">Open →</span>
                </a>
              </div>
            )}

            {/* Customer */}
            <div className="mt-6 rounded-xl bg-cream/60 p-4 text-sm">
              <p className="font-semibold">{order.customerName}</p>
              <p className="text-ink-mute">{order.customerEmail}{order.customerPhone ? ` · ${order.customerPhone}` : ""}</p>
              <p className="mt-1 text-xs text-ink-mute">Placed on {formatDateTime(order.createdAt)}</p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/services" className="btn-outline flex-1">Book another service</Link>
              <Link to="/orders" className="btn-primary flex-1">View my orders</Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink-mute">
          Keep this page handy — bookmark it to check your order status anytime.
        </p>
      </div>
    </div>
  );
}

function prettyKey(k) {
  return k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}
