const esbuild = require('esbuild');
const fg = require('fast-glob');
const path = require('path');
const fs = require('fs');

const entries = fg.sync('./api/src/functions/**/*.index.ts');

entries.forEach((entry) => {
  const name = entry.split('/')[4]
  const outDir = path.join('dist', 'api', name);
  const outfile = path.join(outDir, 'index.mjs')

  fs.mkdirSync(outDir, { recursive: true });

  esbuild.buildSync({
    entryPoints: [entry],
    bundle: true,
    platform: 'node',
    target: 'node24',
    format: 'esm',
    minify: false,
    sourcemap: false,
    packages: "external",
    outfile,
    treeShaking: true,
    banner: {
      js: `
        import { createRequire } from 'module';
        import { fileURLToPath } from 'url';
        import { dirname } from 'path';
        const require = createRequire(import.meta.url);
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        `
    }
  })
})