import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";
import { formatINR } from "../../lib/format.js";
import { Spinner, EmptyState } from "../../components/ui.jsx";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/admin/services").then((res) => setServices(res.data.services)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const remove = async (s) => {
    const hasOrders = s._count?.orders > 0;
    const msg = hasOrders
      ? `"${s.title}" has orders, so it will be hidden (deactivated) instead of deleted. Continue?`
      : `Delete "${s.title}" permanently?`;
    if (!confirm(msg)) return;
    setBusy(s.id);
    try {
      await api.delete(`/admin/services/${s.id}`);
      load();
    } finally {
      setBusy(null);
    }
  };

  const toggleActive = async (s) => {
    setBusy(s.id);
    try {
      // reuse the full update endpoint by resending the record with flipped active
      await api.put(`/admin/services/${s.id}`, {
        title: s.title,
        shortDesc: s.shortDesc,
        description: s.description,
        price: s.price / 100,
        imageUrl: s.imageUrl || "",
        active: !s.active,
        featured: s.featured,
        requiresUpload: s.requiresUpload,
        uploadLabel: s.uploadLabel,
        categoryId: s.categoryId || "",
        fields: s.fields || [],
      });
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">Services</h1>
          <p className="mt-1 text-ink-soft">Add, edit and manage everything you offer.</p>
        </div>
        <Link to="/admin/services/new" className="btn-primary">+ New service</Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner className="h-8 w-8 text-clay-600" /></div>
      ) : services.length === 0 ? (
        <EmptyState title="No services yet" text="Create your first service to start taking orders."
          action={<Link to="/admin/services/new" className="btn-primary mt-2">+ New service</Link>} />
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.id} className={`card flex flex-col gap-4 p-4 sm:flex-row sm:items-center ${!s.active ? "opacity-60" : ""}`}>
              <img src={s.imageUrl || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=60"} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{s.title}</p>
                  {s.featured && <span className="badge bg-clay-100 text-clay-700">Featured</span>}
                  {!s.active && <span className="badge bg-ink/10 text-ink-soft">Hidden</span>}
                  {s.requiresUpload && <span className="badge bg-blue-50 text-blue-700">Upload</span>}
                </div>
                <p className="mt-0.5 text-sm text-ink-mute">
                  {s.category?.name || "Uncategorised"} · {formatINR(s.price)} · {s._count?.orders || 0} orders
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(s)} disabled={busy === s.id} className="btn-ghost px-3 py-1.5 text-xs">
                  {s.active ? "Hide" : "Show"}
                </button>
                <Link to={`/admin/services/${s.id}/edit`} className="btn-outline px-3 py-1.5 text-xs">Edit</Link>
                <button onClick={() => remove(s)} disabled={busy === s.id} className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
