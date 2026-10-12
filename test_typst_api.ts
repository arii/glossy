import { createTypstCompiler } from '@myriaddreamin/typst.ts';

async function main() {
    const compiler = createTypstCompiler();
    await compiler.init();

    compiler.addSource('/main.typ', 'Hello World');
    const res = await compiler.compile({ mainFilePath: '/main.typ' });
    console.log(res);
}
main();
