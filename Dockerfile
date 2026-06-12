# Multi-stage build for the Letoms storefront (Next.js 16).
# Build requires DATABASE_URL: SSG pre-renders pages/sitemap from the DB.

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Force sharp's linux-x64 binary — npm occasionally skips nested optional deps.
RUN npm ci && npm install --no-save --force --os=linux --cpu=x64 sharp

FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
