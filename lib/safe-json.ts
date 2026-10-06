/**
 * Safe JSON serialization utilities.
 * Handles circular references, DOM elements, React Fiber nodes, and browser events
 * to prevent:
 *   TypeError: Converting circular structure to JSON
 *       --> starting at object with constructor 'HTMLElement'
 *       |     property '__reactFiber$...' -> object with constructor 'FiberNode'
 *       --- property 'stateNode' closes the circle
 */

function isDomOrReactArtifact(val: unknown): boolean {
  if (!val || typeof val !== "object") return false;

  // Browser DOM Element, Node, or Event
  if (typeof Node !== "undefined" && val instanceof Node) return true;
  if (typeof Element !== "undefined" && val instanceof Element) return true;
  if (typeof Event !== "undefined" && val instanceof Event) return true;

  // React Fiber or synthetic event check
  const obj = val as Record<string, unknown>;
  if ("nativeEvent" in obj && "target" in obj) return true;
  if ("stateNode" in obj && "child" in obj) return true; // FiberNode
  for (const k of Object.keys(obj)) {
    if (k.startsWith("__reactFiber") || k.startsWith("__reactProps")) {
      return true;
    }
  }

  return false;
}

export function safeJsonStringify(
  value: unknown,
  replacer?: ((key: string, value: unknown) => unknown) | null,
  space?: string | number,
): string {
  const seen = new WeakSet<object>();

  return JSON.stringify(
    value,
    function (this: unknown, key: string, val: unknown) {
      if (isDomOrReactArtifact(val)) {
        return undefined;
      }

      if (typeof val === "object" && val !== null) {
        if (seen.has(val)) {
          return undefined; // Break circular reference
        }
        seen.add(val);
      }

      if (replacer) {
        return replacer.call(this, key, val);
      }
      return val;
    },
    space,
  );
}

export function safeJsonParse<T = unknown>(json: string | null | undefined): T | null {
  if (!json || typeof json !== "string" || json === "undefined" || json === "null" || json.trim() === "") {
    return null;
  }
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function installSafeJsonGlobal(): void {
  if (typeof window === "undefined") return;

  const globalObj = window as unknown as { __glossy_safe_json_installed?: boolean };
  if (globalObj.__glossy_safe_json_installed) return;
  globalObj.__glossy_safe_json_installed = true;

  const nativeStringify = JSON.stringify;

  JSON.stringify = function (
    value: unknown,
    replacer?: ((key: string, value: unknown) => unknown) | (number | string)[] | null,
    space?: string | number,
  ): string {
    const seen = new WeakSet<object>();

    const safeReplacer = function (this: unknown, key: string, val: unknown) {
      if (isDomOrReactArtifact(val)) {
        return undefined;
      }

      if (typeof val === "object" && val !== null) {
        if (seen.has(val)) {
          return undefined;
        }
        seen.add(val);
      }

      if (typeof replacer === "function") {
        return replacer.call(this, key, val);
      }
      return val;
    };

    try {
      return nativeStringify(value, safeReplacer, space);
    } catch {
      try {
        return nativeStringify(value, undefined, space);
      } catch {
        return "{}";
      }
    }
  };
}
