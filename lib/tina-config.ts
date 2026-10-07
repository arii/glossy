import { CONFIG } from "./config";

export const TINA_CLIENT_ID = CONFIG.TINA_CLIENT_ID;
export const TINA_BRANCH = CONFIG.TINA_BRANCH;

export const TINA_LOCAL_GRAPHQL_URL =
  process.env.NEXT_PUBLIC_TINA_LOCAL_URL ?? `http://localhost:${CONFIG.TINA_PORT}/graphql`;

export const TINA_TOKEN = CONFIG.TINA_TOKEN;

export function getTinaCloudUrl(
  clientId: string = TINA_CLIENT_ID,
  branch: string = TINA_BRANCH,
): string {
  return `https://content.tinajs.io/3.0/content/${clientId}/github/${branch}`;
}
