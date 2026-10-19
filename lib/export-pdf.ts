import { createTypstCompiler } from '@myriaddreamin/typst.ts';
import type { TypstCompiler } from '@myriaddreamin/typst.ts';
import { generateTypstSource } from './typst-generator';
import type { TextDocument } from './types';

export type ProgressCallback = (stage: string, step?: number, totalSteps?: number) => void;

export interface PdfExportResult {
  pdfBytes: Uint8Array;
  filename: string;
  title: string;
}

// Function to fetch font as Uint8Array
async function fetchFont(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch font: ${url} (status: ${response.status})`);
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

let compilerPromise: Promise<TypstCompiler> | null = null;

async function getCompiler(onProgress?: ProgressCallback): Promise<TypstCompiler> {
  if (!compilerPromise) {
    compilerPromise = (async () => {
      onProgress?.('Fetching fonts...', 1, 4);

      // @ts-expect-error types not available
      const { setImportWasmModule } = await import('@myriaddreamin/typst-ts-web-compiler');

      setImportWasmModule(async () => {
        return '/typst_ts_web_compiler_bg.wasm';
      });

      const fontUrls = [
        '/fonts/CharisSIL-Regular.ttf',
        '/fonts/CharisSIL-Italic.ttf',
        '/fonts/CharisSIL-Bold.ttf',
      ];

      const fontBuffers = await Promise.all(fontUrls.map(fetchFont));

      onProgress?.('Initializing Typst compiler...', 2, 4);

      const compiler = createTypstCompiler();
      const { loadFonts } = await import('@myriaddreamin/typst.ts');

      await compiler.init({
        beforeBuild: [loadFonts(fontBuffers)],
        getModule: () => '/typst_ts_web_compiler_bg.wasm',
      });
      return compiler;
    })();
  } else {
    onProgress?.('Initializing Typst compiler...', 2, 4);
  }
  return compilerPromise;
}

export function triggerPdfDownload(pdfBytes: Uint8Array, filename: string): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function compilePdfWithWorker(
  doc: TextDocument,
  onProgress?: ProgressCallback
): Promise<PdfExportResult> {
  return new Promise((resolve, reject) => {
    let worker: Worker | null = null;
    try {
      worker = new Worker(
        new URL('../workers/pdf-compiler.worker.ts', import.meta.url),
        { type: 'module' }
      );
    } catch (err) {
      return reject(
        new Error(
          `Failed to initialize Web Worker: ${err instanceof Error ? err.message : String(err)}`
        )
      );
    }

    worker.onmessage = (e: MessageEvent) => {
      const data = e.data || {};
      if (data.type === 'PROGRESS') {
        onProgress?.(data.stage, data.step, data.totalSteps || 4);
      } else if (data.type === 'SUCCESS') {
        worker?.terminate();
        resolve({
          pdfBytes: data.pdfBytes,
          filename: data.filename || `${doc.slug || 'export'}.pdf`,
          title: data.title || doc.title || doc.slug || 'Document',
        });
      } else if (data.type === 'ERROR') {
        worker?.terminate();
        reject(new Error(data.error || 'Worker compilation failed'));
      }
    };

    worker.onerror = (err) => {
      worker?.terminate();
      reject(new Error(err.message || 'Worker runtime error'));
    };

    worker.postMessage({ type: 'COMPILE_PDF', doc });
  });
}

export async function compilePdfMainThread(
  doc: TextDocument,
  onProgress?: ProgressCallback
): Promise<PdfExportResult> {
  const typstSource = generateTypstSource(doc);
  const compiler = await getCompiler(onProgress);

  onProgress?.('Compiling pages...', 3, 4);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawCompiler = (compiler as any).compiler;
  compiler.addSource('/main.typ', typstSource);

  const pdfBytes = rawCompiler.compile('/main.typ', undefined, 'pdf', 0);

  if (!pdfBytes || pdfBytes.length === 0) {
    throw new Error('Typst WASM compilation produced empty byte array.');
  }

  onProgress?.('Preparing download...', 4, 4);

  const filename = `${doc.slug || 'export'}.pdf`;
  const title = doc.title || doc.slug || 'Document';

  return {
    pdfBytes: new Uint8Array(pdfBytes),
    filename,
    title,
  };
}

export async function exportToPdf(
  doc: TextDocument,
  onProgress?: ProgressCallback
): Promise<PdfExportResult> {
  let result: PdfExportResult;

  if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
    try {
      result = await compilePdfWithWorker(doc, onProgress);
    } catch (workerErr) {
      console.warn('Web Worker PDF compilation failed, falling back to main thread:', workerErr);
      result = await compilePdfMainThread(doc, onProgress);
    }
  } else {
    result = await compilePdfMainThread(doc, onProgress);
  }

  triggerPdfDownload(result.pdfBytes, result.filename);
  return result;
}
