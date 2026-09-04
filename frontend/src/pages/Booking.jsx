import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSite } from "../context/SiteContext.jsx";
import { formatINR } from "../lib/format.js";
import { payForOrder } from "../lib/payment.js";
import { Alert, PageLoader } from "../components/ui.jsx";
import NotFound from "./NotFound.jsx";

export default function Booking() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSite();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [customer, setCustomer] = useState({ customerName: "", customerEmail: "", customerPhone: "" });
  const [details, setDetails] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState(""); // "creating" | "paying" | "confirming"
  const fileRef = useRef(null);

  useEffect(() => {
    api
      .get(`/services/${slug}`)
      .then((res) => {
        setService(res.data.service);
        // pre-fill quantity default from a "copies"/"quantity" numeric field
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (user) {
      setCustomer((c) => ({
        customerName: c.customerName || user.name,
        customerEmail: c.customerEmail || user.email,
        customerPhone: c.customerPhone || user.phone || "",
      }));
    }
  }, [user]);

  const fields = useMemo(() => (Array.isArray(service?.fields) ? service.fields : []), [service]);

  // if the service has a numeric "copies" or "quantity" field, drive amount by it
  const qtyField = fields.find((f) => f.type === "number" && ["copies", "quantity"].includes(f.name));
  const effectiveQty = qtyField ? Number(details[qtyField.name]) || 0 : quantity;
  const total = service ? service.price * Math.max(1, effectiveQty || 1) : 0;

  if (loading) return <PageLoader />;
  if (notFound || !service) return <NotFound />;

  const setDetail = (name, value) => setDetails((d) => ({ ...d, [name]: value }));

  const validate = () => {
    if (!customer.customerName.trim()) return "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(customer.customerEmail)) return "Please enter a valid email.";
    for (const f of fields) {
      if (f.required && !String(details[f.name] ?? "").trim()) {
        return `Please fill in “${f.label}”.`;
      }
    }
    if (service.requiresUpload && !file) return `Please upload your file (${service.uploadLabel}).`;
    if (qtyField && (!effectiveQty || effectiveQty < 1)) return `Please enter a valid ${qtyField.label.toLowerCase()}.`;
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) return setError(v);

    setSubmitting(true);
    try {
      // 1. create the order
      setStage("creating");
      const form = new FormData();
      form.append("serviceId", service.id);
      form.append("customerName", customer.customerName);
      form.append("customerEmail", customer.customerEmail);
      if (customer.customerPhone) form.append("customerPhone", customer.customerPhone);
      form.append("details", JSON.stringify(details));
      form.append("quantity", String(Math.max(1, effectiveQty || 1)));
      if (file) form.append("file", file);

      const { data } = await api.post("/orders", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 2. pay
      setStage("paying");
      const resp = await payForOrder({
        order: data.order,
        payment: data.payment,
        customer,
        serviceTitle: service.title,
        siteName: settings.siteName,
      });

      // 3. verify
      setStage("confirming");
      await api.post(`/orders/${data.order.id}/verify`, {
        razorpayOrderId: resp.razorpay_order_id,
        razorpayPaymentId: resp.razorpay_payment_id,
        razorpaySignature: resp.razorpay_signature || "",
      });

      navigate(`/order/${data.order.id}`, { replace: true });
    } catch (err) {
      setError(err.friendlyMessage || err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
      setStage("");
    }
  };

  const stageLabel = { creating: "Creating your order…", paying: "Opening secure payment…", confirming: "Confirming payment…" }[stage];

  return (
    <div className="container-page py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-ink-mute">
        <Link to="/services" className="hover:text-ink">Services</Link>
        <span>/</span>
        <Link to={`/services/${service.slug}`} className="hover:text-ink">{service.title}</Link>
        <span>/</span>
        <span className="text-ink">Booking</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        {/* Form */}
        <form onSubmit={submit} className="space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl">Book: {service.title}</h1>
            <p className="mt-2 text-ink-soft">Fill in the details below. You'll pay securely at the end.</p>
          </div>

          {error && <Alert kind="error">{error}</Alert>}

          {/* Your details */}
          <section className="card p-6">
            <h2 className="text-lg">Your details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full name *</label>
                <input className="input" value={customer.customerName}
                  onChange={(e) => setCustomer({ ...customer, customerName: e.target.value })} placeholder="Your name" />
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input" type="email" value={customer.customerEmail}
                  onChange={(e) => setCustomer({ ...customer, customerEmail: e.target.value })} placeholder="you@example.com" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Phone</label>
                <input className="input" value={customer.customerPhone}
                  onChange={(e) => setCustomer({ ...customer, customerPhone: e.target.value })} placeholder="10-digit mobile number" />
              </div>
            </div>
          </section>

          {/* Service specifics */}
          {(fields.length > 0 || !qtyField) && (
            <section className="card p-6">
              <h2 className="text-lg">Service details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {fields.map((f) => (
                  <Field key={f.name} field={f} value={details[f.name] ?? ""} onChange={(v) => setDetail(f.name, v)} />
                ))}
                {!qtyField && (
                  <div>
                    <label className="label">Quantity</label>
                    <input className="input" type="number" min="1" value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Upload */}
          {service.requiresUpload && (
            <section className="card p-6">
              <h2 className="text-lg">{service.uploadLabel || "Upload your file"} *</h2>
              <p className="mt-1 text-sm text-ink-mute">PDF, images or Word documents up to 20 MB.</p>
              <div
                onClick={() => fileRef.current?.click()}
                className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/15 bg-cream/60 px-6 py-10 text-center transition hover:border-clay-400 hover:bg-clay-50"
              >
                {file ? (
                  <>
                    <span className="text-2xl">📄</span>
                    <p className="font-semibold text-ink">{file.name}</p>
                    <p className="text-xs text-ink-mute">{(file.size / 1024 / 1024).toFixed(2)} MB · click to change</p>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">⤴️</span>
                    <p className="font-semibold text-ink">Click to upload</p>
                    <p className="text-xs text-ink-mute">or drag your file here</p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            </section>
          )}
        </form>

        {/* Summary */}
        <div>
          <div className="sticky top-24 card p-6">
            <h2 className="text-lg">Order summary</h2>
            <div className="mt-4 flex items-center gap-3">
              <img src={service.imageUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
              <div>
                <p className="font-semibold leading-tight">{service.title}</p>
                <p className="text-xs text-ink-mute">{formatINR(service.price)} / unit</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 border-t border-ink/8 pt-4 text-sm">
              <Row label="Unit price" value={formatINR(service.price)} />
              <Row label="Quantity" value={`× ${Math.max(1, effectiveQty || 1)}`} />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-ink/8 pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-display text-2xl font-semibold text-ink">{formatINR(total)}</span>
            </div>

            <button onClick={submit} disabled={submitting} className="btn-primary mt-5 w-full text-base">
              {submitting ? (stageLabel || "Processing…") : `Pay ${formatINR(total)}`}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-mute">
              🔒 Secure checkout via Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-mute">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Field({ field, value, onChange }) {
  const common = { className: "input", value, onChange: (e) => onChange(e.target.value), placeholder: field.placeholder || "" };
  return (
    <div className={field.type === "textarea" ? "sm:col-span-2" : ""}>
      <label className="label">{field.label}{field.required && " *"}</label>
      {field.type === "textarea" ? (
        <textarea rows={3} {...common} />
      ) : field.type === "select" ? (
        <select {...common} className="input">
          <option value="">Select…</option>
          {(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={field.type === "number" ? "number" : field.type || "text"} min={field.type === "number" ? "1" : undefined} {...common} />
      )}
    </div>
  );
}
