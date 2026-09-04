import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { formatDateTime } from "../../lib/format.js";
import { Spinner, EmptyState } from "../../components/ui.jsx";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/admin/messages").then((res) => setMessages(res.data.messages)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggle = async (m) => {
    await api.patch(`/admin/messages/${m.id}`, { handled: !m.handled });
    setMessages((ms) => ms.map((x) => (x.id === m.id ? { ...x, handled: !x.handled } : x)));
  };

  return (
    <div>
      <h1 className="text-3xl">Messages</h1>
      <p className="mt-1 text-ink-soft">Enquiries sent through the contact form.</p>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner className="h-8 w-8 text-clay-600" /></div>
      ) : messages.length === 0 ? (
        <div className="mt-8"><EmptyState title="No messages yet" text="Contact form submissions will show up here." /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`card p-5 ${m.handled ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{m.name}</p>
                    {!m.handled && <span className="badge bg-clay-100 text-clay-700">New</span>}
                  </div>
                  <p className="text-sm text-ink-mute">
                    <a href={`mailto:${m.email}`} className="hover:text-clay-700">{m.email}</a>
                    {m.subject ? ` · ${m.subject}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-mute">{formatDateTime(m.createdAt)}</span>
                  <button onClick={() => toggle(m)} className="btn-outline px-3 py-1.5 text-xs">
                    {m.handled ? "Mark unread" : "Mark handled"}
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
