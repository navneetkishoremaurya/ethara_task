export function getApiBaseUrl() {
  const fromWindow = globalThis?.window?.__APP_CONFIG__?.API_URL;
  const fromVite = import.meta?.env?.VITE_API_URL;
  // Prefer build-time env (Netlify/Vercel) over runtime config.js defaults.
  const raw = (fromVite || fromWindow || "/api").trim();
  // allow relative base like "/api"
  const normalized = raw.startsWith("http") ? raw.replace(/\/+$/, "") : raw.replace(/\/+$/, "");
  return normalized;
}
