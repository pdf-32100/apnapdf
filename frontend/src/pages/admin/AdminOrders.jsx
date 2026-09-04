import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { formatINR, formatDateTime, STATUS_STYLES, statusLabel } from "../../lib/format.js";
import { Spinner, EmptyState } from "../../components/ui.jsx";

const STATUSES = ["PENDING", "PAID", "PROCESSING", "COMPLETED", "CANCELLED"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/orders", { params: { status: filter || undefined } })
      .then((res) => setOrders(res.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const setStatus = async (order, status) => {
    setBusy(order.id);
    try {
      await api.patch(`/admin/orders/${order.id}/status`, { status });
      setOrders((os) => os.map((o) => (o.id === order.id ? { ...o, status } : o)));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">Orders</h1>
          <p className="mt-1 text-ink-soft">Manage and fulfil customer orders.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterBtn active={!filter} onClick={() => setFilter("")}>All</FilterBtn>
          {STATUSES.map((s) => (
            <FilterBtn key={s} active={filter === s} onClick={() => setFilter(s)}>{statusLabel(s)}</FilterBtn>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner className="h-8 w-8 text-clay-600" /></div>
      ) : orders.length === 0 ? (
        <EmptyState title="No orders" text="Orders will appear here as customers book services." />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card overflow-hidden">
              <button onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{o.number}</span>
                    <span className={`badge ${STATUS_STYLES[o.status]}`}>{statusLabel(o.status)}</span>
                    {o.fileUrl && <span className="badge bg-blue-50 text-blue-700">📄 file</span>}
                  </div>
                  <p className="mt-0.5 text-sm text-ink-mute">
                    {o.customerName} · {o.service?.title} · {formatDateTime(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-semibold">{formatINR(o.amount)}</span>
                  <svg className={`text-ink-mute transition ${expanded === o.id ? "rotate-180" : ""}`} width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
                </div>
              </button>

              {expanded === o.id && (
                <div className="border-t border-ink/8 bg-cream/40 p-5">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink-mute">Customer</h4>
                      <p className="mt-2 font-semibold">{o.customerName}</p>
                      <p className="text-sm text-ink-mute">{o.customerEmail}</p>
                      {o.customerPhone && <p className="text-sm text-ink-mute">{o.customerPhone}</p>}

                      <h4 className="mt-5 text-xs font-bold uppercase tracking-wider text-ink-mute">Requirements</h4>
                      <dl className="mt-2 space-y-1 text-sm">
                        {Object.entries(o.details || {}).map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-4 border-b border-ink/6 py-1">
                            <dt className="capitalize text-ink-mute">{k.replace(/([A-Z])/g, " $1")}</dt>
                            <dd className="text-right font-medium">{String(v)}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div>
                      {o.fileUrl && (
                        <>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-mute">Uploaded file</h4>
                          <a href={o.fileUrl} target="_blank" rel="noreferrer"
                            className="mt-2 flex items-center gap-3 rounded-xl border border-ink/10 bg-paper px-4 py-3 hover:border-clay-400">
                            <span className="text-2xl">📄</span>
                            <span className="flex-1 truncate text-sm font-medium">{o.fileName || "file"}</span>
                            <span className="text-sm font-semibold text-clay-700">Open →</span>
                          </a>
                        </>
                      )}
                      {o.razorpayPaymentId && (
                        <div className="mt-4 rounded-xl bg-paper p-3 text-xs text-ink-mute">
                          <p>Payment ID: {o.razorpayPaymentId}</p>
                          {o.paidAt && <p>Paid at: {formatDateTime(o.paidAt)}</p>}
                        </div>
                      )}

                      <h4 className="mt-5 text-xs font-bold uppercase tracking-wider text-ink-mute">Update status</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {STATUSES.map((s) => (
                          <button key={s} onClick={() => setStatus(o, s)} disabled={busy === o.id || o.status === s}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              o.status === s ? "bg-ink text-cream" : "border border-ink/15 bg-paper hover:border-ink/40"
                            }`}>
                            {statusLabel(s)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active ? "border-ink bg-ink text-cream" : "border-ink/12 bg-paper text-ink-soft hover:border-ink/30"
      }`}>
      {children}
    </button>
  );
}
