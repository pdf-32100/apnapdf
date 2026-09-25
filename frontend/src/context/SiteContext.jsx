import { createContext, useContext, useEffect, useState } from "react";
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

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK);
  const [ready, setReady] = useState(false);

  // Tell the image helpers which CDN endpoint the backend is using, so
  // transformations are applied to our own assets only.
  useEffect(() => {
    api
      .get("/config")
      .then((res) => setImageKitEndpoint(res.data?.imagekit?.urlEndpoint))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api
      .get("/content/settings")
      .then((res) => setSettings({ ...FALLBACK, ...(res.data.value || {}) }))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  return <SiteContext.Provider value={{ settings, ready }}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  return ctx || { settings: FALLBACK, ready: true };
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
