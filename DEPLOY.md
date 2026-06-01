# Deploy backend like Netlify (folder / Git — no Docker)

Frontend = Netlify (`frontend/`). Backend = **`backend/`** folder on Railway or Render.

## 0. Free database (once)

1. https://neon.tech → create project → copy **connection string**
2. Save as `DATABASE_URL`

---

## Option A — Railway (easiest, like Netlify)

1. https://railway.app → **New Project** → **Deploy from GitHub repo**
2. Pick this repo
3. Service **Settings**:
   - **Root Directory:** `backend`
   - **Start Command:** `sh scripts/start.sh` (or leave default if `railway.toml` is detected)
4. **Variables** → add `DATABASE_URL` (Neon URL), `CORS_ORIGINS` = `*`
5. **Settings** → **Networking** → **Generate Domain**
6. Done — every `git push` redeploys automatically

**CLI (optional):**

```bash
cd backend
npm i -g @railway/cli
railway login
railway init
railway variables set DATABASE_URL="postgresql://..."
railway up
```

---

## Option B — Render (Python, no Docker)

1. https://dashboard.render.com → **New** → **Blueprint** (uses `render.yaml` in repo root)

   **OR** manual:

2. **New** → **Web Service** → your repo
3. Settings:

| Field | Value |
|-------|--------|
| Runtime | **Python 3** (not Docker) |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `sh scripts/start.sh` |

4. Environment: `DATABASE_URL`, `CORS_ORIGINS`, `PYTHON_VERSION` = `3.12.0`
5. Deploy

---

## Option C — Render Docker (only if you want Docker)

| Root Directory | *(empty)* |
| Dockerfile Path | `backend/Dockerfile` |
| Docker Context | `backend` |

---

## Connect Netlify frontend

Netlify → Environment variables:

```
VITE_API_URL=https://YOUR-BACKEND-URL
```

Redeploy site. API paths are `/products`, `/customers` (no `/api` prefix).

---

## Test

```bash
curl https://YOUR-BACKEND/health
curl https://YOUR-BACKEND/health/db
curl https://YOUR-BACKEND/products
```
