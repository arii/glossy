const IGNORED_ROOT_KEYS = new Set(["fileName", "_sys"]);

export function stringifyCanonical(obj: unknown, isRoot = true): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    const arrayElements = obj.map((el) => stringifyCanonical(el, false)).join(',');
    return `[${arrayElements}]`;
  }

  const record = obj as Record<string, unknown>;
  const keys = Object.keys(record)
    .filter((k) => record[k] !== undefined && (!isRoot || !IGNORED_ROOT_KEYS.has(k)))
    .sort();
  const keyValues = keys.map((k) => {
    return `${JSON.stringify(k)}:${stringifyCanonical(record[k], false)}`;
  }).join(',');

  return `{${keyValues}}`;
}

export function areDocumentsIdentical(docA: unknown, docB: unknown): boolean {
  if (!docA || !docB) return false;
  return stringifyCanonical(docA) === stringifyCanonical(docB);
}

export function sortKeysRecursively(obj: unknown, isRoot = true): unknown {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((el) => sortKeysRecursively(el, false));
  }
  const record = obj as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) {
    if (record[key] !== undefined && (!isRoot || !IGNORED_ROOT_KEYS.has(key))) {
      sorted[key] = sortKeysRecursively(record[key], false);
    }
  }
  return sorted;
}

export function formatExportJson(doc: unknown): string {
  return JSON.stringify(sortKeysRecursively(doc), null, 2) + "\n";
}

export interface DocumentDifference {
  path: string;
  repoVal: unknown;
  draftVal: unknown;
}

export function findDocumentDifferences(
  docDraft: unknown,
  docRepo: unknown,
  prefix = ""
): DocumentDifference[] {
  if (docDraft === docRepo) return [];

  if (
    docDraft === null ||
    docRepo === null ||
    typeof docDraft !== "object" ||
    typeof docRepo !== "object"
  ) {
    if (docDraft !== docRepo) {
      return [{ path: prefix || "(root)", draftVal: docDraft, repoVal: docRepo }];
    }
    return [];
  }

  if (Array.isArray(docDraft) || Array.isArray(docRepo)) {
    if (!Array.isArray(docDraft) || !Array.isArray(docRepo)) {
      return [{ path: prefix || "(root)", draftVal: docDraft, repoVal: docRepo }];
    }
    const diffs: DocumentDifference[] = [];
    const maxLen = Math.max(docDraft.length, docRepo.length);
    for (let i = 0; i < maxLen; i++) {
      diffs.push(...findDocumentDifferences(docDraft[i], docRepo[i], `${prefix}[${i}]`));
    }
    return diffs;
  }

  const recDraft = docDraft as Record<string, unknown>;
  const recRepo = docRepo as Record<string, unknown>;
  const isRoot = prefix === "";
  const allKeys = new Set([
    ...Object.keys(recDraft).filter((k) => recDraft[k] !== undefined && (!isRoot || !IGNORED_ROOT_KEYS.has(k))),
    ...Object.keys(recRepo).filter((k) => recRepo[k] !== undefined && (!isRoot || !IGNORED_ROOT_KEYS.has(k))),
  ]);

  const diffs: DocumentDifference[] = [];
  for (const key of Array.from(allKeys).sort()) {
    const valDraft = recDraft[key];
    const valRepo = recRepo[key];
    const path = prefix ? `${prefix}.${key}` : key;
    diffs.push(...findDocumentDifferences(valDraft, valRepo, path));
  }
  return diffs;
}


