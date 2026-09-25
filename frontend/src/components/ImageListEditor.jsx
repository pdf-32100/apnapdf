import ImageUploader from "./ImageUploader.jsx";

/**
 * Admin editor for an ordered list of images (e.g. the home page gallery).
 * Each slot is a full ImageUploader, so every picture is a real upload.
 */
export default function ImageListEditor({
  label = "Images",
  items = [],
  onChange,
  kind = "content",
  hint = "JPG, PNG or WebP up to 10 MB.",
  max = 12,
  addLabel = "+ Add image",
  note,
}) {
  const list = Array.isArray(items) ? items : [];

  const setAt = (i, url) => onChange(list.map((it, idx) => (idx === i ? url : it)));
  const add = () => onChange([...list, ""]);
  const removeAt = (i) => onChange(list.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <button
          type="button"
          onClick={add}
          disabled={list.length >= max}
          className="btn-outline px-3 py-1.5 text-xs disabled:opacity-40"
        >
          {addLabel}
        </button>
      </div>

      {note && <p className="mb-3 text-xs text-ink-mute">{note}</p>}

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink/15 bg-cream/60 px-4 py-6 text-center text-sm text-ink-mute">
          No images yet — the built-in samples are shown on the site until you add your own.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((url, i) => (
            <div key={i} className="rounded-xl border border-ink/10 bg-cream/40 p-3">
              <ImageUploader
                label={i === 0 ? "Image 1 (shown large)" : `Image ${i + 1}`}
                kind={kind}
                value={url}
                onChange={(v) => setAt(i, v)}
                hint={hint}
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move earlier"
                    className="grid h-7 w-7 place-items-center rounded-lg border border-ink/10 text-xs hover:bg-paper disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === list.length - 1}
                    aria-label="Move later"
                    className="grid h-7 w-7 place-items-center rounded-lg border border-ink/10 text-xs hover:bg-paper disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Delete slot
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
