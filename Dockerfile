# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite bakes these into the build output. Defaults already live in
# .env.production; declaring them as build ARGs lets a Railway service
# variable of the same name override them at build time if needed.
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}
ARG VITE_ENABLE_ROLE_SWITCHER
ENV VITE_ENABLE_ROLE_SWITCHER=${VITE_ENABLE_ROLE_SWITCHER}

RUN npm run build

# ---- Serve stage ----
FROM caddy:2-alpine
WORKDIR /app

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist ./dist
