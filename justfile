set dotenv-load := true

default:
    @just --list

# -------- cc-proxy (Rust worker) --------

local:
    npx --yes wrangler@latest dev --local --port 8787

local-tee log="proxy.log":
    npx --yes wrangler@latest dev --local --port 8787 2>&1 | tee {{log}}

build:
    worker-build --release

login:
    npx --yes wrangler@latest login

# Route patterns are NOT in wrangler.toml — bind them once in the
# Cloudflare dashboard (Workers → cc-proxy → Settings → Domains & Routes)
# as  $DOMAIN/v1/*  and  $DOMAIN/_cm/*  so the public repo never carries
# your hostname.
deploy:
    npx --yes wrangler@latest deploy

tail:
    npx --yes wrangler@latest tail --format pretty

clean:
    rm -rf build target .wrangler

# -------- claudemetry (Astro dashboard) --------

dashboard-dev:
    cd dashboard && pnpm dev

# DOMAIN comes from .env (see .env.example). Injected at deploy time as
# a Worker var so the dashboard can reference its own hostname without
# baking it into source. Custom domain binding is a one-time CF dashboard
# step (Workers → claudemetry → Settings → Domains).
dashboard-deploy:
    cd dashboard && pnpm build && npx --yes wrangler@latest deploy --var DOMAIN:"$DOMAIN"

dashboard-tail:
    cd dashboard && npx --yes wrangler@latest tail --format pretty

# Deploy both workers.
deploy-all: deploy dashboard-deploy
