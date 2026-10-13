export function stringifyCanonical(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    const arrayElements = obj.map((el) => stringifyCanonical(el)).join(',');
    return `[${arrayElements}]`;
  }

  const record = obj as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  const keyValues = keys.map((k) => {
    return `${JSON.stringify(k)}:${stringifyCanonical(record[k])}`;
  }).join(',');

  return `{${keyValues}}`;
}

export function areDocumentsIdentical(docA: unknown, docB: unknown): boolean {
  if (!docA || !docB) return false;
  return stringifyCanonical(docA) === stringifyCanonical(docB);
}

export function sortKeysRecursively(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortKeysRecursively);
  }
  const record = obj as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(record).sort()) {
    sorted[key] = sortKeysRecursively(record[key]);
  }
  return sorted;
}

export function formatExportJson(doc: unknown): string {
  return JSON.stringify(sortKeysRecursively(doc), null, 2) + "\n";
}

