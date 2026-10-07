import { CONFIG } from "./config";

export const TINA_CLIENT_ID =
  process.env.NEXT_PUBLIC_TINA_CLIENT_ID ||
  "7cf6793a-dfc2-4a6b-ae23-c2665e22f286";

export const TINA_BRANCH =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.TINA_BRANCH ||
  process.env.CF_PAGES_BRANCH ||
  process.env.HEAD ||
  "main";

export const TINA_LOCAL_GRAPHQL_URL =
  process.env.NEXT_PUBLIC_TINA_LOCAL_URL || `http://localhost:${CONFIG.TINA_PORT}/graphql`;

export const TINA_TOKEN = process.env.TINA_TOKEN || "";

export function getTinaCloudUrl(
  clientId: string = TINA_CLIENT_ID,
  branch: string = TINA_BRANCH,
): string {
  return `https://content.tinajs.io/3.0/content/${clientId}/github/${branch}`;
}
