// Writes a Markdown copy next to every exported HTML page (out/foo.html -> out/foo.md).
// functions/_middleware.js serves these when a request sends Accept: text/markdown.
import fs from 'fs';
import path from 'path';
import { NodeHtmlMarkdown } from 'node-html-markdown';

const OUT = path.join(process.cwd(), 'out');
const SITE = 'https://www.estebandalelr.co';
const SKIP_DIRS = new Set(['_next']);
const SKIP_FILES = new Set(['404.html']);

const nhm = new NodeHtmlMarkdown({ ignore: ['script', 'style', 'noscript', 'svg', 'template', 'canvas'] });

function* htmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* htmlFiles(full);
    } else if (entry.name.endsWith('.html') && !SKIP_FILES.has(entry.name)) {
      yield full;
    }
  }
}

function routeFor(file) {
  const rel = path.relative(OUT, file).split(path.sep).join('/').replace(/\.html$/, '');
  return rel === 'index' ? '/' : `/${rel.replace(/\/index$/, '')}`;
}

let count = 0;
for (const file of htmlFiles(OUT)) {
  const html = fs.readFileSync(file, 'utf8');
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
  const title =
    html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ||
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim() ||
    'Esteban Dalel R';
  const markdown = nhm.translate(body).replace(/\n{3,}/g, '\n\n').trim();
  const front = `---\ntitle: ${JSON.stringify(title)}\nurl: ${SITE}${routeFor(file)}\n---\n\n`;
  fs.writeFileSync(file.replace(/\.html$/, '.md'), front + markdown + '\n');
  count++;
}
console.log(`build-markdown: wrote ${count} Markdown pages`);
