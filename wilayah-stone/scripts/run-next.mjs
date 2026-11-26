import {fileURLToPath} from 'node:url';
const [command,...args]=process.argv.slice(2);
if(!['dev','build','start'].includes(command))throw Error('Use dev, build or start.');
process.env.WS_NATIVE_NEXT='1';
const cli=new URL('../node_modules/next/dist/bin/next',import.meta.url);
process.argv=[process.execPath,fileURLToPath(cli),command,...(command==='start'?[]:['--webpack']),...args];
await import(cli.href);
