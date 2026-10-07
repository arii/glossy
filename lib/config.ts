export const CONFIG = {
  PORT: Number(process.env.PORT ?? 3000),
  TINA_PORT: Number(process.env.TINA_PORT ?? 4001),
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://glossed.pages.dev",
  TINA_CLIENT_ID: process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? "7cf6793a-dfc2-4a6b-ae23-c2665e22f286",
  TINA_BRANCH:
    process.env.NEXT_PUBLIC_TINA_BRANCH ??
    process.env.TINA_BRANCH ??
    process.env.CF_PAGES_BRANCH ??
    process.env.HEAD ??
    "main",
  TINA_TOKEN: process.env.TINA_TOKEN ?? "",
  isLocal(hostname: string): boolean {
    return hostname === "localhost" || hostname === "127.0.0.1";
  },
} as const;
