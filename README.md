# DroughtSmart Portal Frontend

React + TypeScript + Vite portal for farmers, admins, and field staff.

## Backend

The portal uses the NestJS API in **`../ds-back-master`** (Railway: `https://ds-back-production.up.railway.app`).

See [../ds-back-master/MIGRATION_PLAN.md](../ds-back-master/MIGRATION_PLAN.md) for the backend roadmap.

### Local portal + live Railway API

1. In `.env.development`, keep:
   `VITE_API_PROXY_TARGET=https://ds-back-production.up.railway.app`
2. `npm run dev`
3. Sign in with a production Nest account (`user` → Farmer, `admin` → Admin).

### Local Nest API

1. Configure `../ds-back-master/.env` from `.env.example`, then `npm run start:dev` (port 3000).
2. Set `VITE_API_PROXY_TARGET=http://127.0.0.1:3000` and restart Vite.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`
