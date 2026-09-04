import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client.js";
import { Alert, PageLoader } from "../../components/ui.jsx";

const BLANK = {
  title: "",
  shortDesc: "",
  description: "",
  price: "",
  imageUrl: "",
  active: true,
  featured: false,
  requiresUpload: false,
  uploadLabel: "Upload your file",
  categoryId: "",
  fields: [],
};

const FIELD_TYPES = ["text", "number", "textarea", "select", "tel", "email", "date"];

export default function ServiceForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(BLANK);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newCat, setNewCat] = useState("");

  useEffect(() => {
    api.get("/admin/categories").then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editing) return;
    api
      .get(`/admin/services/${id}`)
      .then((res) => {
        const s = res.data.service;
        setForm({
          title: s.title,
          shortDesc: s.shortDesc,
          description: s.description,
          price: String(s.price / 100),
          imageUrl: s.imageUrl || "",
          active: s.active,
          featured: s.featured,
          requiresUpload: s.requiresUpload,
          uploadLabel: s.uploadLabel || "Upload your file",
          categoryId: s.categoryId || "",
          fields: Array.isArray(s.fields) ? s.fields : [],
        });
      })
      .catch(() => setError("Could not load this service."))
      .finally(() => setLoading(false));
  }, [id, editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addField = () =>
    set("fields", [...form.fields, { name: "", label: "", type: "text", required: false, options: [] }]);
  const updateField = (i, patch) =>
    set("fields", form.fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const removeField = (i) => set("fields", form.fields.filter((_, idx) => idx !== i));

  const createCategory = async () => {
    if (!newCat.trim()) return;
    try {
      const res = await api.post("/admin/categories", { name: newCat.trim() });
      setCategories((c) => [...c, res.data.category]);
      set("categoryId", res.data.category.id);
      setNewCat("");
    } catch (err) {
      setError(err.friendlyMessage || "Could not add category.");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.shortDesc || !form.description) return setError("Please fill in title, short description and full description.");
    if (form.price === "" || Number(form.price) < 0) return setError("Please enter a valid price.");

    // normalise fields: derive name from label if missing; clean options
    const fields = form.fields
      .filter((f) => f.label.trim())
      .map((f) => ({
        name: (f.name || f.label).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""),
        label: f.label.trim(),
        type: f.type,
        required: !!f.required,
        placeholder: f.placeholder || "",
        options: f.type === "select"
          ? (Array.isArray(f.options) ? f.options : String(f.options || "").split(",")).map((o) => o.trim()).filter(Boolean)
          : undefined,
      }));

    const payload = {
      title: form.title.trim(),
      shortDesc: form.shortDesc.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      imageUrl: form.imageUrl.trim(),
      active: form.active,
      featured: form.featured,
      requiresUpload: form.requiresUpload,
      uploadLabel: form.uploadLabel.trim() || "Upload your file",
      categoryId: form.categoryId,
      fields,
    };

    setSaving(true);
    try {
      if (editing) await api.put(`/admin/services/${id}`, payload);
      else await api.post("/admin/services", payload);
      navigate("/admin/services");
    } catch (err) {
      setError(err.friendlyMessage || "Could not save the service.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <button onClick={() => navigate("/admin/services")} className="mb-4 text-sm font-semibold text-ink-mute hover:text-ink">← Back to services</button>
      <h1 className="text-3xl">{editing ? "Edit service" : "New service"}</h1>

      <form onSubmit={submit} className="mt-6 space-y-6">
        {error && <Alert kind="error">{error}</Alert>}

        <section className="card space-y-4 p-6">
          <h2 className="text-lg">Basics</h2>
          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Photocopy / PDF Printing" />
          </div>
          <div>
            <label className="label">Short description *</label>
            <input className="input" value={form.shortDesc} onChange={(e) => set("shortDesc", e.target.value)} placeholder="One line shown on cards" />
          </div>
          <div>
            <label className="label">Full description *</label>
            <textarea className="input" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the service. Use blank lines for paragraphs." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Price (₹) *</label>
              <input className="input" type="number" min="0" step="1" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. 5" />
              <p className="mt-1 text-xs text-ink-mute">Per unit / per copy. Customers can choose quantity.</p>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                <option value="">Uncategorised</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="mt-2 flex gap-2">
                <input className="input py-1.5 text-sm" value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Add new category" />
                <button type="button" onClick={createCategory} className="btn-outline px-3 py-1.5 text-sm">Add</button>
              </div>
            </div>
          </div>
          <div>
            <label className="label">Image URL</label>
            <input className="input" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" />
            {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-3 h-32 w-full rounded-xl object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />}
          </div>
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="text-lg">Options</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Toggle label="Active (visible)" checked={form.active} onChange={(v) => set("active", v)} />
            <Toggle label="Featured on home" checked={form.featured} onChange={(v) => set("featured", v)} />
            <Toggle label="Requires file upload" checked={form.requiresUpload} onChange={(v) => set("requiresUpload", v)} />
          </div>
          {form.requiresUpload && (
            <div>
              <label className="label">Upload prompt</label>
              <input className="input" value={form.uploadLabel} onChange={(e) => set("uploadLabel", e.target.value)} placeholder="e.g. Upload the PDF you want printed" />
            </div>
          )}
        </section>

        {/* Dynamic booking fields */}
        <section className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg">Booking form fields</h2>
              <p className="text-sm text-ink-mute">Extra questions customers answer when booking.</p>
            </div>
            <button type="button" onClick={addField} className="btn-outline px-3 py-1.5 text-sm">+ Add field</button>
          </div>

          {form.fields.length === 0 && <p className="text-sm text-ink-mute">No custom fields yet. The customer will still provide name, email, phone and quantity.</p>}

          <div className="space-y-3">
            {form.fields.map((f, i) => (
              <div key={i} className="rounded-xl border border-ink/10 bg-cream/50 p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input className="input" value={f.label} onChange={(e) => updateField(i, { label: e.target.value })} placeholder="Field label (e.g. Number of copies)" />
                  <div className="flex items-center gap-2">
                    <select className="input" value={f.type} onChange={(e) => updateField(i, { type: e.target.value })}>
                      {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <label className="flex items-center gap-1.5 whitespace-nowrap text-sm">
                      <input type="checkbox" checked={f.required} onChange={(e) => updateField(i, { required: e.target.checked })} /> req.
                    </label>
                    <button type="button" onClick={() => removeField(i)} className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 hover:bg-rose-50">✕</button>
                  </div>
                </div>
                {f.type === "select" && (
                  <input
                    className="input mt-2"
                    value={Array.isArray(f.options) ? f.options.join(", ") : f.options || ""}
                    onChange={(e) => updateField(i, { options: e.target.value.split(",").map((o) => o.trimStart()) })}
                    placeholder="Options, comma separated (e.g. A4, A3, Letter)"
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/admin/services")} className="btn-ghost">Cancel</button>
          <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Create service"}</button>
        </div>
      </form>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3 rounded-xl border border-ink/10 bg-paper px-4 py-3 text-left text-sm font-semibold transition hover:border-ink/25">
      <span className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-clay-600" : "bg-ink/20"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-4" : "left-0.5"}`} />
      </span>
      {label}
    </button>
  );
}
