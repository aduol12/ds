# DroughtSmart Backend Migration Plan

**Canonical backend:** `ds-back-master` (NestJS) — production: Railway `ds-back-production`  
**Frontend:** `frontend/` (role-based portal)  
**Retired:** FastAPI `Backend/` (removed / being removed)

This plan is the Phase 2 deliverable. Major schema/domain builds must follow the waves below.

---

## 1. Current architecture (audit summary)

| Area | Status | Notes |
|------|--------|--------|
| Auth | Partial | Phone+password login, JWT 60m, register, `/users/me`. No refresh, logout, password reset, email verify |
| Roles | Incomplete | Only `user` \| `admin`. Portal needs 5 roles |
| Kits / IoT | Strong | Kits, config, live/history/summary, ingest, MQTT control, advisory pipeline |
| Alerts | Partial | CRUD-ish; some routes unauthenticated |
| Users/profile | Good | Farm profile, settings, Cloudinary avatar |
| Farms / fields / crops | Missing | Farm is only a profile blob on User |
| Farmer CRM | Missing | Admin Farmers UI is static |
| Irrigation domain | Thin | Manual control + kit config modes only — no zones/schedules/history entities |
| Weather | Missing in Nest | Frontend uses WeatherAPI client-side (unused on most pages) |
| AI advisory product | Thin | Device advisory strings only; no crop/disease/risk APIs |
| Notifications | Missing | Settings flags exist; no SMS/email/in-app delivery |
| Reports / export | Missing | |
| Orgs / billing / audit | Missing | Super-admin UI is static |
| Quality | Weak | `synchronize: true`, default JWT secret, no ValidationPipe, open IoT/admin routes, duplicate config controller |

### Reusable modules (keep & harden)

- `auth`, `users`, `assets` (kits), `config`, `data`, `iot`, `alerts`, `mqtt`, `cloudinary`

### Incomplete / outdated / redundant

- Soft-delete kit not routed; permanent kit delete not admin-gated
- `kit-config.controller.ts` duplicate / unwired
- Public ingest/config/advisory/alert create and open `GET /users`
- Role guard previously used string `.includes` (fixed)
- No migrations; schema drift risk

### Frontend API reality (wired today)

Real Nest calls: login, register, `/users/me`, profile/farm/settings/picture, kits CRUD (partial), live/history, irrigation control.

Most redesigned pages (super-admin, agronomist, field-tech, farmers/farms CRM, alerts UI, reports) are **UI-only** and do not yet call APIs.

---

## 2. Target architecture (clean Nest layout)

```
ds-back-master/src/
  main.ts
  app.module.ts
  common/                 # filters, interceptors, pipes, dto, guards, decorators
  config/                 # app config validation (env schema) — rename kit config module
  modules/
    auth/
    users/
    organizations/        # Phase wave 3
    farms/                # farms, fields, blocks, crops, plantings
    farmers/
    devices/              # evolve from assets/kits
    telemetry/            # evolve from data/
    irrigation/
    weather/              # provider interface + mock/OpenWeather/WeatherAPI
    advisory/             # AI service interface + mock
    notifications/        # SMS/email/in-app providers
    reports/
    media/
    alerts/
    mqtt/
```

**Principles**

- Module boundaries with thin controllers, services, repositories
- Global `ValidationPipe`, exception filter, response interceptor
- RBAC via `@Roles()` + permissions where needed
- TypeORM migrations (`synchronize: false` in production)
- Provider ports for weather / notifications / AI

---

## 3. Role model (target)

| Nest enum | Portal |
|-----------|--------|
| `SUPER_ADMIN` | Super Admin |
| `ADMIN` | Admin |
| `AGRONOMIST` | Agronomist |
| `FIELD_TECHNICIAN` | Field Officer / Field Tech |
| `FARMER` | Farmer |

**Migration:** map existing DB `user` → `FARMER`, `admin` → `ADMIN` (one-time SQL/data migration). Keep temporary aliases in JWT for one release if needed.

---

## 4. Delivery waves (do not big-bang)

### Wave 0 — Cleanup & baseline ✅ (in progress / largely done)
- Remove FastAPI `Backend/`
- Point docs/env at Nest only
- Migration plan (this doc)
- Foundation: ValidationPipe, exception filter, health, `.env.example`, role enum expansion + mapping, logout + refresh stubs, soft-delete kit route, secure open admin/list routes, `GET /api/data/live` (all kits)

### Wave 1 — Auth & RBAC (production critical) ✅ started
- ✅ Rotating refresh tokens (`POST /auth/refresh-token` with body `{ refresh_token }`)
- ✅ Logout revokes refresh tokens
- ✅ Password reset (`POST /auth/forgot-password`, `POST /auth/reset-password`) — SMS/email provider TODO
- ✅ Device API keys (`POST/GET/DELETE /api/devices/api-keys`) + ingest guard (`X-Device-Api-Key`, `ALLOW_OPEN_INGEST`)
- ✅ Staff roles see all kits/live/summary; `GET /api/iot/data/all` admin-only
- ⏳ Email/SMS provider wiring for reset tokens

### Wave 2 — Domain core (farms + farmers + devices) ✅
- ✅ `Farm` + `Field` entities and `/api/farms` CRUD + fields
- ✅ `/api/farmers` list/detail for staff roles (+ farm_count)
- ✅ Link kits → farms/fields (`POST /api/farms/:id/kits`); planting/harvest APIs
- ✅ Dashboard summary `GET /api/dashboard/summary`
- ✅ Admin Farmers / Farms / FarmerDetails pages wired to Nest

### Wave 3 — Irrigation, alerts UI, notifications ✅
- ✅ Irrigation zones + events (`/api/irrigation/zones`, start/stop, events)
- ✅ Staff-scoped alerts list; admin Alerts page wired to `/api/alerts`
- ✅ Notification outbox + mock provider (`/api/notifications`)
- ✅ Irrigation schedules + water usage (`/api/irrigation/zones/:id/schedules`, `/api/irrigation/usage`)
- ⏳ Real SMS/email providers (Twilio/SendGrid)
- ⏳ Schedule runner / cron executor

### Wave 4 — Weather, AI advisory, reports, media
- Weather provider adapter + forecasts/alerts
- Advisory service (mock models) + history
- Reports with CSV/Excel export
- Media uploads beyond avatar (farm docs/images)

### Wave 5 — Hardening & tests
- Rate limiting, security headers, pagination standards
- E2E + unit coverage for auth, kits, farms, irrigation
- Load/index review

---

## 5. Database redesign (high level)

**Keep:** `User`, farm profile/settings, `IotKit`, `KitConfiguration`, `SensorData`, `SystemAlert`

**Add:**
- `organizations`, `organization_members`
- `farms`, `fields`, `blocks`
- `crops`, `plantings`, `harvests`
- `irrigation_zones`, `irrigation_schedules`, `irrigation_events`
- `notifications`, `notification_deliveries`
- `advisories`
- `weather_snapshots` (cache)
- `refresh_tokens`, `password_reset_tokens`
- `device_api_keys` (for ingest)

**Rules:** FKs + indexes on `(farmer_id)`, `(kit_id, timestamp)`, `(farm_id)`, `(user_id)`. Migrations via TypeORM.

---

## 6. API conventions

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

Errors:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "phone_number", "message": "required" }]
}
```

All list endpoints: `page`, `limit`, `sort`, `search`, filters. Auth: Bearer JWT. Roles enforced server-side.

**Compatibility:** Keep existing portal paths (`/auth/login`, `/api/assets/kit`, `/api/data/live/:id`, …) during Waves 0–2; introduce new REST under `/api/v1/...` for farms/farmers/etc., then migrate frontend.

---

## 7. Frontend sync priority

| Priority | UI surface | Backend work |
|----------|------------|--------------|
| P0 | Farmer home, admin devices/live/irrigation | Harden existing kit/data/control |
| P0 | Login / roles | 5-role RBAC |
| P1 | Admin Farmers / Farms | Farmer + Farm modules |
| P1 | Alerts pages | Wire alerts APIs |
| P2 | Dashboards KPIs | Aggregate endpoints |
| P2 | Field tech / agronomist | Role-scoped farm/task APIs |
| P3 | Super-admin orgs/billing | Organizations module |
| P3 | Weather / AI / reports | Provider modules |

---

## 8. Risks & decisions

1. **Enum migration** on Postgres Role column — needs careful ALTER (create new enum / cast).
2. **`synchronize: true`** must turn off before Wave 2 entities land in production.
3. **Device trust** — ingest stays public until device keys exist; mark as known risk.
4. **Scope control** — Phases 3–9 in the request are multi-sprint; Waves above are the execution order. Mock AI/weather/SMS is acceptable if interfaces are real and marked `TODO(provider)`.

---

## 9. Immediate next steps (Wave 0 / Wave 1 start)

1. Finish FastAPI directory removal + reference purge  
2. Add Nest foundation (common layer, env validation, health)  
3. Expand roles + seed/migrate mapping  
4. Auth: logout, refresh, consistent login payload  
5. Kits: soft-delete route; data: `GET /api/data/live`  
6. Lock down `GET /users` and unauthenticated deletes  

Then proceed Wave 1–2 without rewriting kit/MQTT paths that already serve production.
