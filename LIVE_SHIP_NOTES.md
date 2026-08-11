# Live portal ship notes (2026-08-11)

## Completed in this pass

### Frontend git
- Merged `origin/main` into portal `main` (commit `53de1cb`).
- Added Super Admin profile re-export, phone normalize helper, Devices create hardening.
- Pushed to fork: `aduol12/ds` `main` (`53de1cb`).

### Marketing site (local)
- Portal links already point at `https://app.droughtsmartltd.com` in:
  - `droughtsmart-solutions/src/lib/config.ts`
  - `droughtsmart-solutions/.env.production`
  - `droughtsmart-solutions/.env.local`
- Folder has **no git repo** (Netlify site id `d42369b8-c46e-4022-be9b-244746062663` in `.netlify/state.json`). Redeploy from Netlify UI or `netlify deploy --prod` after login.

## Blocked (needs org owner)

1. **Push to `droughtsmart/frontend`** → HTTP **403** (no write access).
2. **Railway `frontend` deploy** on workspace project `positive-transformation` → **Free plan resource provision limit exceeded**.
3. Live domain **`app.droughtsmartltd.com`** is on DroughtSmart production Railway; this CLI only controls staging workspace.

### Owner finish checklist (live UI)
1. Merge/push `aduol12/ds` `main` (`53de1cb`) into `droughtsmart/frontend` `main` (grant write access or open/merge PR).
2. Redeploy the service behind `app.droughtsmartltd.com`.
3. Ensure build env: `VITE_API_BASE=https://ds-back-production.up.railway.app`, `VITE_ENABLE_ROLE_SWITCHER=false` (or same-origin rewrites to that Nest host).
4. Smoke-test: `/login`, devices, profile.
5. Redeploy marketing site so Portal CTA uses `https://app.droughtsmartltd.com/login`.

## Deferred production Nest (by plan — higher risk)

Do **not** deploy `ds-back-master` Wave 2–4 / tasks to production `ds-back-production` until:

- Production Railway project access is available
- Checklist: login, kit list/control/MQTT healthy, then farms/tasks
- Confirm production `DB_SYNCHRONIZE` policy

Staging Nest for API testing: `https://ds-back-production-4788.up.railway.app`.
