/// <reference types="astro/client" />

declare module "cloudflare:workers" {
  interface Env {
    USER_STORE: DurableObjectNamespace;
    SESSION: KVNamespace;
    ASSETS: Fetcher;
    DOMAIN: string;
  }
}

export {};
