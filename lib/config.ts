export const CONFIG = {
  PORT: Number(process.env.PORT ?? 3000),
  TINA_PORT: Number(process.env.TINA_PORT ?? 4001),
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://glossed.pages.dev",
  isLocal(hostname: string): boolean {
    return hostname === "localhost" || hostname === "127.0.0.1";
  },
} as const;
