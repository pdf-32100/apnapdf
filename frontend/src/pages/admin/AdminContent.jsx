import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { Alert, Spinner } from "../../components/ui.jsx";

const TABS = [
  { key: "settings", label: "Site settings" },
  { key: "home", label: "Home page" },
  { key: "about", label: "About page" },
  { key: "contact", label: "Contact page" },
];

export default function AdminContent() {
  const [tab, setTab] = useState("settings");
  return (
    <div>
      <h1 className="text-3xl">Site content</h1>
      <p className="mt-1 text-ink-soft">Edit the text and images across your website — no code needed.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              tab === t.key ? "border-ink bg-ink text-cream" : "border-ink/12 bg-paper text-ink-soft hover:border-ink/30"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <ContentEditor key={tab} tab={tab} />
      </div>
    </div>
  );
}

function ContentEditor({ tab }) {
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ kind: "", msg: "" });

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/content/${tab}`).then((res) => setValue(res.data.value || {})).catch(() => setValue({})).finally(() => setLoading(false));
  }, [tab]);

  const save = async () => {
    setSaving(true);
    setStatus({ kind: "", msg: "" });
    try {
      await api.put(`/admin/content/${tab}`, { value });
      setStatus({ kind: "success", msg: "Saved! Changes are live on the site." });
    } catch (err) {
      setStatus({ kind: "error", msg: err.friendlyMessage || "Could not save." });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !value) return <div className="flex justify-center py-16"><Spinner className="h-7 w-7 text-clay-600" /></div>;

  const set = (k, v) => setValue((s) => ({ ...s, [k]: v }));

  return (
    <div className="space-y-6">
      {status.msg && <Alert kind={status.kind}>{status.msg}</Alert>}

      {tab === "settings" && <SettingsForm value={value} set={set} />}
      {tab === "home" && <HomeForm value={value} set={set} />}
      {tab === "about" && <AboutForm value={value} set={set} />}
      {tab === "contact" && <ContactForm value={value} set={set} />}

      <div className="sticky bottom-4 flex justify-end">
        <button onClick={save} disabled={saving} className="btn-primary shadow-lift">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

/* ---- field helpers ---- */
function Text({ label, value, onChange, placeholder, textarea, rows = 3 }) {
  return (
    <div>
      <label className="label">{label}</label>
      {textarea ? (
        <textarea className="input" rows={rows} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className="input" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="card space-y-4 p-6">
      <h2 className="text-lg">{title}</h2>
      {children}
    </section>
  );
}

// Editor for an array of objects with given fields
function ListEditor({ label, items = [], fields, onChange, blank }) {
  const update = (i, patch) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const add = () => onChange([...items, { ...blank }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <button type="button" onClick={add} className="btn-outline px-3 py-1.5 text-xs">+ Add</button>
      </div>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-ink/10 bg-cream/50 p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
                  {f.textarea ? (
                    <textarea className="input" rows={2} value={it[f.key] || ""} onChange={(e) => update(i, { [f.key]: e.target.value })} placeholder={f.label} />
                  ) : (
                    <input className="input" value={it[f.key] || ""} onChange={(e) => update(i, { [f.key]: e.target.value })} placeholder={f.label} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-right">
              <button type="button" onClick={() => remove(i)} className="text-xs font-semibold text-rose-600 hover:underline">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- per-block forms ---- */
function SettingsForm({ value, set }) {
  const social = value.social || {};
  const setSocial = (k, v) => set("social", { ...social, [k]: v });
  return (
    <Card title="Business details">
      <div className="grid gap-4 sm:grid-cols-2">
        <Text label="Site name" value={value.siteName} onChange={(v) => set("siteName", v)} />
        <Text label="Tagline" value={value.tagline} onChange={(v) => set("tagline", v)} />
        <Text label="Email" value={value.email} onChange={(v) => set("email", v)} />
        <Text label="Phone" value={value.phone} onChange={(v) => set("phone", v)} />
        <Text label="Working hours" value={value.hours} onChange={(v) => set("hours", v)} />
        <Text label="WhatsApp number" value={social.whatsapp} onChange={(v) => setSocial("whatsapp", v)} />
      </div>
      <Text label="Address" value={value.address} onChange={(v) => set("address", v)} textarea rows={2} />
    </Card>
  );
}

function HomeForm({ value, set }) {
  return (
    <>
      <Card title="Hero section">
        <Text label="Headline" value={value.heroTitle} onChange={(v) => set("heroTitle", v)} />
        <Text label="Subtext" value={value.heroSubtitle} onChange={(v) => set("heroSubtitle", v)} textarea />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Button text" value={value.heroCta} onChange={(v) => set("heroCta", v)} />
          <Text label="Hero image URL" value={value.heroImage} onChange={(v) => set("heroImage", v)} />
        </div>
      </Card>
      <Card title="Stats">
        <ListEditor label="Highlight numbers" items={value.stats} onChange={(v) => set("stats", v)}
          blank={{ value: "", label: "" }}
          fields={[{ key: "value", label: "Value (e.g. 12,000+)" }, { key: "label", label: "Label" }]} />
      </Card>
      <Card title="How it works">
        <ListEditor label="Steps" items={value.steps} onChange={(v) => set("steps", v)}
          blank={{ title: "", text: "" }}
          fields={[{ key: "title", label: "Title" }, { key: "text", label: "Text", textarea: true, full: true }]} />
      </Card>
      <Card title="Testimonials">
        <ListEditor label="Customer quotes" items={value.testimonials} onChange={(v) => set("testimonials", v)}
          blank={{ name: "", role: "", text: "" }}
          fields={[{ key: "name", label: "Name" }, { key: "role", label: "Role" }, { key: "text", label: "Quote", textarea: true, full: true }]} />
      </Card>
    </>
  );
}

function AboutForm({ value, set }) {
  return (
    <>
      <Card title="About content">
        <Text label="Title" value={value.title} onChange={(v) => set("title", v)} />
        <Text label="Subtitle" value={value.subtitle} onChange={(v) => set("subtitle", v)} />
        <Text label="Body (blank line = new paragraph)" value={value.body} onChange={(v) => set("body", v)} textarea rows={6} />
        <Text label="Image URL" value={value.image} onChange={(v) => set("image", v)} />
      </Card>
      <Card title="Values">
        <ListEditor label="What you stand for" items={value.values} onChange={(v) => set("values", v)}
          blank={{ title: "", text: "" }}
          fields={[{ key: "title", label: "Title" }, { key: "text", label: "Text", textarea: true, full: true }]} />
      </Card>
    </>
  );
}

function ContactForm({ value, set }) {
  return (
    <Card title="Contact page">
      <Text label="Title" value={value.title} onChange={(v) => set("title", v)} />
      <Text label="Subtitle" value={value.subtitle} onChange={(v) => set("subtitle", v)} textarea rows={2} />
      <p className="text-sm text-ink-mute">Phone, email, address and hours are pulled from <strong>Site settings</strong>.</p>
    </Card>
  );
}
