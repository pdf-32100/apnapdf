import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";
import { formatINR, formatDate, STATUS_STYLES, statusLabel } from "../../lib/format.js";
import { Spinner } from "../../components/ui.jsx";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats").then((res) => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner className="h-8 w-8 text-clay-600" /></div>;
  if (!data) return <p>Could not load dashboard.</p>;

  const { stats, recentOrders } = data;
  const cards = [
    { label: "Revenue", value: formatINR(stats.revenue), icon: "💰", tone: "bg-moss-100" },
    { label: "Paid orders", value: stats.paidOrders, icon: "✅", tone: "bg-emerald-50" },
    { label: "Total orders", value: stats.orders, icon: "📦", tone: "bg-clay-50" },
    { label: "Services", value: stats.services, icon: "🧾", tone: "bg-blue-50" },
    { label: "Customers", value: stats.users, icon: "👥", tone: "bg-amber-50" },
    { label: "Unread messages", value: stats.unreadMessages, icon: "💬", tone: "bg-rose-50" },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl">Dashboard</h1>
        <p className="mt-1 text-ink-soft">A quick look at how your shop is doing.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-4 p-5">
            <span className={`grid h-12 w-12 place-items-center rounded-xl text-xl ${c.tone}`}>{c.icon}</span>
            <div>
              <div className="font-display text-2xl font-semibold">{c.value}</div>
              <div className="text-sm text-ink-mute">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-clay-700 hover:text-clay-800">View all →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="mt-6 text-sm text-ink-mute">No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-left text-xs uppercase tracking-wider text-ink-mute">
                  <th className="py-2 pr-4">Order</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Service</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 text-right">Amount</th>
                  <th className="py-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-ink/5 last:border-0">
                    <td className="py-3 pr-4 font-semibold">{o.number}</td>
                    <td className="py-3 pr-4">{o.customerName}</td>
                    <td className="py-3 pr-4 text-ink-mute">{o.service}</td>
                    <td className="py-3 pr-4"><span className={`badge ${STATUS_STYLES[o.status]}`}>{statusLabel(o.status)}</span></td>
                    <td className="py-3 pr-4 text-right font-medium">{formatINR(o.amount)}</td>
                    <td className="py-3 text-right text-ink-mute">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
