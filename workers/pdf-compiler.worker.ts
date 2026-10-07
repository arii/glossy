import { createTypstCompiler, loadFonts } from "@myriaddreamin/typst.ts";
import { generateTypstSource } from "../lib/typst-generator";
import type { TextDocument } from "../lib/types";

const FONT_CACHE_NAME = "glossy-fonts-v1";
const FONT_FILES = [
  "/fonts/CharisSIL-Regular.ttf",
  "/fonts/CharisSIL-Italic.ttf",
  "/fonts/CharisSIL-Bold.ttf",
];

async function getCachedFont(url: string): Promise<Uint8Array> {
  let cache: Cache | undefined;
  if (typeof caches !== "undefined") {
    try {
      cache = await caches.open(FONT_CACHE_NAME);
      const cachedResponse = await cache.match(url);
      if (cachedResponse && cachedResponse.ok) {
        const buffer = await cachedResponse.arrayBuffer();
        return new Uint8Array(buffer);
      }
    } catch {
      // Ignore CacheStorage errors
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch font: ${url} (status: ${response.status})`);
  }

  const buffer = await response.arrayBuffer();
  if (cache) {
    try {
      await cache.put(
        url,
        new Response(buffer.slice(0), {
          headers: { "Content-Type": "font/ttf" },
        })
      );
    } catch {
      // Ignore cache put errors
    }
  }

  return new Uint8Array(buffer);
}

let compilerInstance: ReturnType<typeof createTypstCompiler> | null = null;
let initPromise: Promise<ReturnType<typeof createTypstCompiler>> | null = null;

async function getCompiler(): Promise<ReturnType<typeof createTypstCompiler>> {
  if (compilerInstance) return compilerInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const fontBuffers = await Promise.all(
      FONT_FILES.map((url) => getCachedFont(url))
    );

    const compiler = createTypstCompiler();
    // Pass fontLoader to beforeBuild during compiler initialization
    await compiler.init({
      beforeBuild: [loadFonts(fontBuffers)],
    } as unknown as Parameters<typeof compiler.init>[0]);

    compilerInstance = compiler;
    return compiler;
  })();

  return initPromise;
}

export interface CompilePdfMessage {
  type: "COMPILE_PDF";
  doc: TextDocument;
}

const ctx: Worker = self as unknown as Worker;

ctx.onmessage = async (e: MessageEvent<CompilePdfMessage>) => {
  if (e.data?.type === "COMPILE_PDF") {
    try {
      const typstSource = generateTypstSource(e.data.doc);
      const compiler = await getCompiler();

      compiler.addSource("/main.typ", typstSource);

      const rawCompiler = (
        compiler as unknown as {
          compiler: {
            compile: (
              path: string,
              inputs: undefined,
              fmt: string,
              diag: number
            ) => Uint8Array;
          };
        }
      ).compiler;

      const pdfBytes: Uint8Array = rawCompiler.compile(
        "/main.typ",
        undefined,
        "pdf",
        0
      );

      if (!pdfBytes || pdfBytes.length === 0) {
        throw new Error("Typst compilation returned empty output.");
      }

      ctx.postMessage({ type: "SUCCESS", pdfBytes }, [pdfBytes.buffer]);
    } catch (err: unknown) {
      ctx.postMessage({
        type: "ERROR",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
};
