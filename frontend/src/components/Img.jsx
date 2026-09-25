import { useMemo, useState } from "react";
import { ikUrl, ikSrcSet, ikPlaceholder } from "../lib/imagekit.js";

/**
 * The single <img> used across the site.
 *
 * - ImageKit sources get resized / re-encoded (AVIF-WebP) / a responsive srcSet
 * - other URLs (Unsplash, an admin-pasted link) still render normally
 * - a tiny blurred version is painted behind the image until it decodes
 * - a broken URL falls back to `fallback` instead of a broken-image icon
 *
 * It renders a plain <img> with no wrapper, so it is a drop-in replacement
 * anywhere the markup already sizes the image.
 */
export default function Img({
  src,
  alt = "",
  width,
  height,
  widths,
  sizes,
  quality,
  focus,
  crop,
  fallback = "",
  className = "",
  style,
  loading = "lazy",
  ...rest
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const source = (failed ? fallback : src) || fallback;

  const { finalSrc, srcSet, placeholder } = useMemo(() => {
    const opts = { width, height, quality, focus, crop };
    return {
      finalSrc: ikUrl(source, opts),
      srcSet: widths ? ikSrcSet(source, widths, opts) : undefined,
      placeholder: ikPlaceholder(source),
    };
  }, [source, width, height, quality, focus, crop, widths]);

  if (!source) return null;

  const blurStyle =
    placeholder && !loaded
      ? { backgroundImage: `url("${placeholder}")`, backgroundSize: "cover", backgroundPosition: "center" }
      : null;

  return (
    <img
      src={finalSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes || "100vw" : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => {
        setLoaded(true);
        if (!failed && fallback && source !== fallback) setFailed(true);
      }}
      className={className}
      style={blurStyle ? { ...blurStyle, ...style } : style}
      {...rest}
    />
  );
}
