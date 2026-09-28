import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/client.js";
import { setImageKitEndpoint } from "../lib/imagekit.js";

const SiteContext = createContext(null);

const FALLBACK = {
  siteName: "PrintWala",
  tagline: "Print Your Ideas",
  email: "hello@printwala.test",
  phone: "+91 98765 43210",
  address: "",
  hours: "",
  social: {},
};

// Last settings we saw, so a custom logo/favicon shows on first paint
// instead of flashing the defaults while /content/settings loads.
const CACHE_KEY = "site-settings";

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch {
    return {};
  }
}

// Swap the tab icon for the one uploaded in Admin → Site settings.
function applyFavicon(url) {
  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  if (!link.dataset.default) link.dataset.default = link.getAttribute("href") || "/favicon.svg";
  if (url) {
    link.removeAttribute("type");
    link.href = url;
  } else {
    link.type = "image/svg+xml";
    link.href = link.dataset.default;
  }
}

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(() => ({ ...FALLBACK, ...readCache() }));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    applyFavicon(settings.faviconUrl);
  }, [settings.faviconUrl]);

  // Tell the image helpers which CDN endpoint the backend is using, so
  // transformations are applied to our own assets only.
  useEffect(() => {
    api
      .get("/config")
      .then((res) => setImageKitEndpoint(res.data?.imagekit?.urlEndpoint))
      .catch(() => {});
  }, []);

  // Also called by the admin editor after saving, so the new logo shows at once.
  const updateSettings = useCallback((value = {}) => {
    setSettings({ ...FALLBACK, ...value });
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(value));
    } catch {}
  }, []);

  useEffect(() => {
    api
      .get("/content/settings")
      .then((res) => updateSettings(res.data.value || {}))
      .catch(() => {})
      .finally(() => setReady(true));
  }, [updateSettings]);

  return <SiteContext.Provider value={{ settings, ready, updateSettings }}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  return ctx || { settings: FALLBACK, ready: true, updateSettings: () => {} };
}

// Generic hook to load any content block by key.
export function useContentBlock(key) {
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get(`/content/${key}`)
      .then((res) => alive && setValue(res.data.value || {}))
      .catch(() => alive && setValue({}))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [key]);
  return { value: value || {}, loading };
}
