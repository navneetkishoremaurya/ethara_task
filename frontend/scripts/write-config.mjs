import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const apiUrl = (process.env.VITE_API_URL || "").trim();
const out = resolve(dirname(fileURLToPath(import.meta.url)), "../public/config.js");

if (!apiUrl) {
  console.warn(
    "WARNING: VITE_API_URL is not set.\n" +
      "Railway/Netlify: add VITE_API_URL = https://your-backend.up.railway.app"
  );
}

writeFileSync(
  out,
  `// Generated at build time — do not edit by hand\nwindow.__APP_CONFIG__ = { API_URL: ${JSON.stringify(apiUrl)} };\n`
);

console.log("Wrote public/config.js with API_URL:", apiUrl || "(empty)");
