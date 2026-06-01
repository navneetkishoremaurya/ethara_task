export function getApiBaseUrl() {
  const fromVite = import.meta.env.VITE_API_URL?.trim();
  const fromWindow = globalThis?.window?.__APP_CONFIG__?.API_URL?.trim();
  const raw = fromVite || fromWindow || "";

  if (!raw) {
    console.error(
      "API URL missing. On Netlify set VITE_API_URL to your Railway URL, then redeploy."
    );
    return "/api";
  }

  return raw.startsWith("http") ? raw.replace(/\/+$/, "") : raw.replace(/\/+$/, "");
}
