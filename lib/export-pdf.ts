import { createTypstCompiler } from '@myriaddreamin/typst.ts';
import type { TypstCompiler } from '@myriaddreamin/typst.ts';
import { generateTypstSource } from './typst-generator';
import type { TextDocument } from './types';

// Function to fetch font as Uint8Array
async function fetchFont(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch font: ${url}`);
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

let compilerPromise: Promise<TypstCompiler> | null = null;

async function getCompiler() {
  if (!compilerPromise) {
    compilerPromise = (async () => {
      // Use ts-ignore to bypass the types for setImportWasmModule as it is missing from typings
      // @ts-expect-error types not available
      const { setImportWasmModule } = await import('@myriaddreamin/typst-ts-web-compiler');

      setImportWasmModule(async () => {
          return '/typst_ts_web_compiler_bg.wasm';
      });

      const compiler = createTypstCompiler();

      const fontUrls = [
        '/fonts/CharisSIL-Regular.ttf',
        '/fonts/CharisSIL-Italic.ttf',
        '/fonts/CharisSIL-Bold.ttf',
      ];

      const fontBuffers = await Promise.all(fontUrls.map(fetchFont));

      const { loadFonts } = await import('@myriaddreamin/typst.ts');

      await compiler.init({
        beforeBuild: [loadFonts(fontBuffers)],
        getModule: () => '/typst_ts_web_compiler_bg.wasm',
      });
      return compiler;
    })();
  }
  return compilerPromise;
}

export async function exportToPdf(doc: TextDocument): Promise<void> {
  const source = generateTypstSource(doc);

  const compiler = await getCompiler();

  try {
    // using the inner compiler API per test-pdf-export.mjs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawCompiler = (compiler as any).compiler;

    // addSource is also on compiler
    compiler.addSource('/main.typ', source);

    const pdfBytes = rawCompiler.compile('/main.typ', undefined, 'pdf', 0);

    if (!pdfBytes || pdfBytes.length === 0) {
      throw new Error('Typst WASM compilation produced empty byte array');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.slug || 'export'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Typst compilation failed:', err);
    alert('Failed to generate PDF. Check the console for more details.');
  }
}
