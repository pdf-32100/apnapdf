import { useState } from "react";
import api from "../api/client.js";
import { useContentBlock, useSite } from "../context/SiteContext.jsx";
import { Alert } from "../components/ui.jsx";

export default function Contact() {
  const { value: contact } = useContentBlock("contact");
  const { settings } = useSite();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ kind: "", msg: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ kind: "", msg: "" });
    setSending(true);
    try {
      const res = await api.post("/content/contact/message", form);
      setStatus({ kind: "success", msg: res.data.message });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus({ kind: "error", msg: err.friendlyMessage || "Could not send your message." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.18em] text-clay-600">
          Contact
        </span>
        <h1 className="text-4xl sm:text-5xl">{contact.title || "Get in touch"}</h1>
        <p className="mt-3 text-ink-soft">{contact.subtitle || "We'd love to hear from you."}</p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Info */}
        <div className="space-y-4">
          <InfoCard icon="📞" title="Call us" lines={[settings.phone]} />
          <InfoCard icon="✉️" title="Email us" lines={[settings.email]} />
          <InfoCard icon="📍" title="Visit us" lines={[settings.address]} />
          <InfoCard icon="🕑" title="Working hours" lines={[settings.hours]} />
        </div>

        {/* Form */}
        <form onSubmit={submit} className="card p-7">
          {status.msg && <div className="mb-4"><Alert kind={status.kind}>{status.msg}</Alert></div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name *</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Subject</label>
            <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div className="mt-4">
            <label className="label">Message *</label>
            <textarea className="input" rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <button className="btn-primary mt-5 w-full" disabled={sending}>
            {sending ? "Sending…" : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, lines }) {
  if (!lines?.filter(Boolean).length) return null;
  return (
    <div className="card flex items-start gap-4 p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-clay-50 text-lg">{icon}</span>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {lines.filter(Boolean).map((l, i) => <p key={i} className="text-sm text-ink-mute">{l}</p>)}
      </div>
    </div>
  );
}
