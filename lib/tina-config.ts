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

export const TINA_LOCAL_GRAPHQL_URL = (
  process.env.NEXT_PUBLIC_TINA_LOCAL_URL ||
  (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:4001/graphql` : "http://localhost:4001/graphql")
)
  .trim()
  .replace(/[\r\n\t]+/g, "");

export const TINA_TOKEN = (process.env.TINA_TOKEN || "")
  .trim()
  .replace(/[\r\n\t]+/g, "");

export function getTinaCloudUrl(
  clientId: string = TINA_CLIENT_ID,
  branch: string = TINA_BRANCH,
): string {
  let safeClientId = encodeURIComponent(clientId.trim().replace(/[\r\n\t]+/g, ""));
  let safeBranch = encodeURIComponent(branch.trim().replace(/[\r\n\t]+/g, ""));

  if (!safeClientId || safeClientId === "undefined" || !safeBranch || safeBranch === "undefined") {
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.hostname}:4001/graphql`;
    }
  }

  return `https://content.tinajs.io/3.0/content/${safeClientId}/github/${safeBranch}`;
}
