import { build } from 'esbuild';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const publicDir = path.join(projectRoot, 'public');
const distDir = path.join(projectRoot, 'dist');
const assetsDir = path.join(distDir, 'assets');

async function cleanDist() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });
}

async function copyPublic() {
  // Copy everything under public/ into dist/
  const copyRecursive = async (src, dest) => {
    const stat = await fs.stat(src);
    if (stat.isDirectory()) {
      await fs.mkdir(dest, { recursive: true });
      const entries = await fs.readdir(src);
      for (const entry of entries) {
        await copyRecursive(path.join(src, entry), path.join(dest, entry));
      }
    } else {
      await fs.copyFile(src, dest);
    }
  };
  try {
    await copyRecursive(publicDir, distDir);
  } catch (err) {
    if (err && err.code === 'ENOENT') return; // public may not exist
    throw err;
  }
}

async function buildCss() {
  const inputCssPath = path.join(srcDir, 'index.css');
  const cssOutDir = assetsDir;
  await fs.mkdir(cssOutDir, { recursive: true });
  const css = await fs.readFile(inputCssPath, 'utf8');
  const result = await postcss([tailwindcss, autoprefixer]).process(css, {
    from: inputCssPath,
    to: path.join(cssOutDir, 'index.css'),
  });
  await fs.writeFile(path.join(cssOutDir, 'index.css'), result.css, 'utf8');
}

async function buildJs() {
  // Resolve alias @/ to src directory
  const aliasPlugin = {
    name: 'alias-src',
    setup(build) {
      const tryResolve = async (p) => {
        const candidates = [
          p,
          `${p}.tsx`,
          `${p}.ts`,
          `${p}.jsx`,
          `${p}.js`,
          path.join(p, 'index.tsx'),
          path.join(p, 'index.ts'),
          path.join(p, 'index.jsx'),
          path.join(p, 'index.js'),
        ];
        for (const c of candidates) {
          try {
            const stat = await fs.stat(c);
            if (stat.isFile()) return c;
          } catch {}
        }
        return p; // fallback; esbuild may still handle assets via loaders
      };

      build.onResolve({ filter: /^@\// }, async (args) => {
        const raw = args.path.replace(/^@\//, '');
        const abs = path.join(srcDir, raw);
        const resolved = await tryResolve(abs);
        return { path: resolved };
      });
    },
  };

  const result = await build({
    entryPoints: [path.join(srcDir, 'main.tsx')],
    outdir: assetsDir,
    bundle: true,
    format: 'esm',
    splitting: true,
    sourcemap: true,
    minify: true,
    target: ['es2019'],
    jsx: 'automatic',
    loader: {
      '.png': 'file',
      '.jpg': 'file',
      '.jpeg': 'file',
      '.svg': 'file',
      '.mp3': 'file',
      '.css': 'css',
      '.webp': 'file',
    },
    assetNames: 'assets/[name]-[hash]',
    entryNames: '[name]-[hash]',
    chunkNames: 'chunks/[name]-[hash]',
    publicPath: '/assets',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
    plugins: [aliasPlugin],
    metafile: true,
  });
  return result.metafile;
}

async function writeIndexHtml(jsFileName) {
  // Use the project's existing index.html as a template to preserve look & meta
  const templatePath = path.join(projectRoot, 'index.html');
  let html = await fs.readFile(templatePath, 'utf8');
  // Replace Vite script that points to /src/main.tsx with built JS
  html = html.replace(/<script[^>]*src=["']\/src\/main\.(t|j)sx?["'][^>]*><\/script>/, `\n    <script type="module" src="/assets/${jsFileName}"></script>`);
  // Ensure stylesheet is linked (insert before </head> if not present)
  if (!/href=["']\/assets\/index\.css["']/.test(html)) {
    html = html.replace(/<\/head>/, `    <link rel="stylesheet" href="/assets/index.css" />\n  </head>`);
  }
  await fs.writeFile(path.join(distDir, 'index.html'), html, 'utf8');
}

async function findMainJsName() {
  const files = await fs.readdir(assetsDir);
  const mainFile = files.find((f) => /^main-.*\.js$/.test(f)) || 'main.js';
  return `/assets/${mainFile}`;
}

async function finalizeHtmlWithHashedAssets(extraCssFiles = []) {
  const files = await fs.readdir(assetsDir);
  const jsFile = files.find((f) => /^main-.*\.js$/.test(f)) || 'main.js';
  const cssFile = files.find((f) => /^index\.css$/.test(f)) || 'index.css';
  const htmlPath = path.join(distDir, 'index.html');
  let html = await fs.readFile(htmlPath, 'utf8');
  html = html.replace('/assets/main.js', `/assets/${jsFile}`);
  html = html.replace('/assets/index.css', `/assets/${cssFile}`);
  // Inject any additional CSS emitted by esbuild (e.g., from library CSS imports)
  const uniqueExtras = Array.from(new Set(extraCssFiles.filter((f) => f !== 'index.css')));
  if (uniqueExtras.length > 0) {
    const links = uniqueExtras.map((f) => `    <link rel="stylesheet" href="/assets/${f}" />`).join('\n');
    html = html.replace(/<\/head>/, `${links}\n  </head>`);
  }
  await fs.writeFile(htmlPath, html, 'utf8');
}

async function main() {
  await cleanDist();
  await copyPublic();
  await buildCss();
  const meta = await buildJs();
  const files = await fs.readdir(assetsDir);
  const jsFile = files.find((f) => /^main-.*\.js$/.test(f)) || 'main.js';
  await writeIndexHtml(jsFile);
  // Collect additional css files from metafile outputs within assetsDir
  const extraCss = Object.keys(meta.outputs || {})
    .map((o) => path.basename(o))
    .filter((n) => n.endsWith('.css'));
  await finalizeHtmlWithHashedAssets(extraCss);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


