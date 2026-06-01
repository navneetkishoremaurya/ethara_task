# Deploy guide

## Backend (Railway)

1. New service → repo → **Root Directory:** `backend`
2. Variables: `DATABASE_URL` (Neon), `CORS_ORIGINS` = frontend URL (or `*` for testing)
3. Generate domain → e.g. `https://etharainventorytask-production.up.railway.app`

## Frontend (Railway)

1. Same project → **New Service** → same repo → **Root Directory:** `frontend`
2. Variables (required at **build** time):

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://etharainventorytask-production.up.railway.app` |

3. Generate domain → e.g. `https://your-frontend.up.railway.app`
4. Update **backend** `CORS_ORIGINS` to the frontend URL → redeploy backend

## Test

```bash
curl https://YOUR-BACKEND/health
curl https://YOUR-BACKEND/products
# open https://YOUR-FRONTEND in browser
```

## Netlify (optional)

If using Netlify instead of Railway for frontend: set `VITE_API_URL` there and redeploy.

