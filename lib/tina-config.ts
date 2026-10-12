export const TINA_CLIENT_ID = (
  process.env.NEXT_PUBLIC_TINA_CLIENT_ID ||
  process.env.TINA_CLIENT_ID ||
  ""
)
  .trim()
  .replace(/[\r\n\t]+/g, "");

export const TINA_BRANCH = (
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.TINA_BRANCH ||
  process.env.CF_PAGES_BRANCH ||
  process.env.HEAD ||
  "main"
)
  .trim()
  .replace(/[\r\n\t]+/g, "");

export const TINA_TOKEN = (process.env.TINA_TOKEN || "")
  .trim()
  .replace(/[\r\n\t]+/g, "");

/**
 * Returns true if running in local development mode.
 */
export function isLocalMode(): boolean {
  if (process.env.NEXT_PUBLIC_TINA_IS_LOCAL === "true") return true;
  if (typeof window !== "undefined") {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "[::1]"
    );
  }
  return process.env.NODE_ENV !== "production";
}

/**
 * Unified TinaCMS GraphQL endpoint, updated with .env (NEXT_PUBLIC_TINA_GRAPHQL_URL)
 * or resolved based on local vs remote mode.
 */
export function getTinaGraphQLUrl(
  clientId: string = TINA_CLIENT_ID,
  branch: string = TINA_BRANCH,
): string {
  // If explicitly specified in .env, use that
  if (process.env.NEXT_PUBLIC_TINA_GRAPHQL_URL) {
    return process.env.NEXT_PUBLIC_TINA_GRAPHQL_URL.trim().replace(/[\r\n\t]+/g, "");
  }

  // Local development GraphQL server
  if (isLocalMode()) {
    const port = process.env.NEXT_PUBLIC_TINA_PORT || process.env.TINA_PORT || "4001";
    return `http://localhost:${port}/graphql`;
  }

  const safeClientId = encodeURIComponent(clientId.trim().replace(/[\r\n\t]+/g, ""));
  const safeBranch = encodeURIComponent(branch.trim().replace(/[\r\n\t]+/g, ""));
  if (!safeClientId || safeClientId === "undefined" || !safeBranch || safeBranch === "undefined") {
    return "";
  }

  return `https://content.tinajs.io/3.0/content/${safeClientId}/github/${safeBranch}`;
}
