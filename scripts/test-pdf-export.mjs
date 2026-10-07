import fs from 'fs';
import { createTypstCompiler, loadFonts } from '@myriaddreamin/typst.ts';
import { generateTypstSource, escapeTypst } from '../lib/typst-generator.ts';

async function testPdfExport() {
  console.log('Testing client-side Typst WebAssembly PDF export pipeline & font preloading...');

  // Test escapeTypst
  const escaped = escapeTypst('#hello *world* [test]');
  if (escaped.includes('\\#') && escaped.includes('\\*') && escaped.includes('\\[')) {
    console.log('✓ escapeTypst special character escaping verified.');
  } else {
    throw new Error('escapeTypst failed');
  }

  // Test generateTypstSource
  const sampleDoc = {
    title: 'Test Document',
    slug: 'test-document',
    author: 'Test Author',
    sentences: [
      {
        id: 's1',
        sentence_number: 1,
        tokens: [
          { id: 't1', text: 'Ōhthere', gloss: 'Ohthere.NOM' },
          { id: 't2', text: 'sǣde', gloss: 'say.PST.3SG' },
          { id: 't3', text: 'his', gloss: 'his.GEN' },
        ],
      },
    ],
  };

  const source = generateTypstSource(sampleDoc);
  if (source.includes('Ōhthere') && source.includes('#grid(') && source.includes('Charis SIL')) {
    console.log('✓ generateTypstSource interlinear grid generation verified.');
  } else {
    throw new Error('generateTypstSource output verification failed');
  }

  // Test Typst Wasm Compiler compilation with Charis SIL fonts
  const compiler = createTypstCompiler();
  const fontPaths = [
    'public/fonts/CharisSIL-Regular.ttf',
    'public/fonts/CharisSIL-Italic.ttf',
    'public/fonts/CharisSIL-Bold.ttf',
  ];

  const fontBuffers = fontPaths.map((p) => new Uint8Array(fs.readFileSync(p)));
  await compiler.init({
    beforeBuild: [loadFonts(fontBuffers)],
  });

  compiler.addSource('/main.typ', source);
  const rawCompiler = compiler.compiler;
  const pdfBytes = rawCompiler.compile('/main.typ', undefined, 'pdf', 0);

  if (!pdfBytes || pdfBytes.length === 0) {
    throw new Error('Typst WASM compilation produced empty byte array');
  }

  const magicHeader = String.fromCharCode(...pdfBytes.slice(0, 8));
  if (!magicHeader.startsWith('%PDF-1.')) {
    throw new Error(`Invalid PDF header: ${magicHeader}`);
  }

  console.log(`✓ PDF compiled successfully (${pdfBytes.length} bytes). Magic header: ${magicHeader.slice(0, 8)}`);
  console.log('Client-side Typst WASM PDF Export pipeline test PASSED!\n');
}

testPdfExport().catch((err) => {
  console.error('PDF Export Test FAILED:', err);
  process.exit(1);
});
