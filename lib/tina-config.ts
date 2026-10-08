export const TINA_CLIENT_ID = (
  process.env.NEXT_PUBLIC_TINA_CLIENT_ID ||
  "7cf6793a-dfc2-4a6b-ae23-c2665e22f286"
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
 * Returns the GraphQL URL for TinaCMS commits.
 * Returns the local GraphQL URL in development, and the cloud URL in production.
 */
export function getTinaGraphQLUrl(
  clientId: string = TINA_CLIENT_ID,
  branch: string = TINA_BRANCH,
): string {
  // Check if we are running in a local environment
  const isLocalHost = typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (isLocalHost) {
    return (
      process.env.NEXT_PUBLIC_TINA_LOCAL_URL ||
      `${window.location.protocol}//${window.location.hostname}:4001/graphql`
    )
      .trim()
      .replace(/[\r\n\t]+/g, "");
  }

  // Construct Cloud URL
  const safeClientId = encodeURIComponent(clientId.trim().replace(/[\r\n\t]+/g, ""));
  const safeBranch = encodeURIComponent(branch.trim().replace(/[\r\n\t]+/g, ""));

  if (!safeClientId || safeClientId === "undefined" || !safeBranch || safeBranch === "undefined") {
    throw new Error("TinaCloud URL is invalid or missing required TINA_CLIENT_ID / TINA_BRANCH config.");
  }

  return `https://content.tinajs.io/3.0/content/${safeClientId}/github/${safeBranch}`;
}
