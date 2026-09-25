import { useRef, useState } from "react";
import api from "../api/client.js";
import Img from "./Img.jsx";
import { isImageKitUrl } from "../lib/imagekit.js";

/**
 * Admin image field: drop / pick a file and it goes straight to ImageKit,
 * or paste an external URL if you'd rather link one.
 *
 * `value` is always the final public URL that gets saved with the record.
 */
export default function ImageUploader({
  label = "Image",
  value = "",
  onChange,
  kind = "content", // "service" | "content" — decides the ImageKit folder
  hint = "JPG, PNG or WebP up to 10 MB. Served and resized by ImageKit.",
  className = "",
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  // fileId of the asset we uploaded in this session, so "Remove" can clean it up.
  const [lastFileId, setLastFileId] = useState(null);

  const send = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("That file is not an image.");
    if (file.size > 10 * 1024 * 1024) return setError("Images must be under 10 MB.");

    setError("");
    setBusy(true);
    try {
      const body = new FormData();
      body.append("image", file);
      body.append("kind", kind);
      const res = await api.post("/admin/uploads/image", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const image = res.data.image;
      setLastFileId(image.fileId || null);
      onChange(image.url);
    } catch (err) {
      setError(err.friendlyMessage || "Upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async () => {
    const fileId = lastFileId;
    setLastFileId(null);
    onChange("");
    // Best-effort cleanup of an asset that was never saved with a record.
    if (fileId) api.delete(`/admin/uploads/${fileId}`).catch(() => {});
  };

  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrl((s) => !s)}
          className="text-xs font-semibold text-ink-mute hover:text-ink"
        >
          {showUrl ? "Hide URL field" : "Use a URL instead"}
        </button>
      </div>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-ink/10 bg-cream/60">
          <Img
            src={value}
            alt=""
            width={800}
            height={450}
            className="h-40 w-full object-cover"
            loading="eager"
          />
          <div className="flex items-center justify-between gap-2 border-t border-ink/8 bg-paper px-3 py-2">
            <span className="truncate text-xs text-ink-mute">
              {isImageKitUrl(value)
                ? "☁︎ Served by ImageKit"
                : /\/uploads\//.test(value)
                ? "💾 Stored on the server (set up ImageKit to use the CDN)"
                : "🔗 External URL"}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="btn-outline px-3 py-1 text-xs"
              >
                {busy ? "Uploading…" : "Replace"}
              </button>
              <button
                type="button"
                onClick={remove}
                className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !busy && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            send(e.dataTransfer.files?.[0]);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
            dragging ? "border-clay-400 bg-clay-50" : "border-ink/15 bg-cream/60 hover:border-clay-400 hover:bg-clay-50"
          }`}
        >
          <span className="text-2xl">{busy ? "⏳" : "🖼️"}</span>
          <p className="text-sm font-semibold text-ink">{busy ? "Uploading to ImageKit…" : "Click to upload or drop an image"}</p>
          <p className="text-xs text-ink-mute">{hint}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={(e) => send(e.target.files?.[0] || null)}
      />

      {showUrl && (
        <input
          className="input mt-2 text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
        />
      )}

      {error && <p className="mt-2 text-xs font-semibold text-rose-700">{error}</p>}
    </div>
  );
}
