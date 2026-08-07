# CORS Configuration (NestJS / ds-back-master)

Portal origins must be allowed by Nest CORS in `ds-back-master/src/main.ts`.

Set Railway / `.env`:

```bash
FRONTEND_URLS=http://localhost:5173,http://localhost:5175,https://frontend-six-blond-iqepd2m4y4.vercel.app,https://app.droughtsmartltd.com
```

Vercel production uses same-origin rewrites to Railway (`frontend/vercel.json`), so browser CORS to Railway is often avoided in prod. Local Vite proxies `/auth`, `/users`, `/api` and also avoids cross-origin issues.

If calling Nest directly from the browser, ensure the portal origin is listed in `FRONTEND_URLS`.
