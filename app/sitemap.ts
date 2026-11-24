import fs from 'fs';
import path from 'path';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const SITE = 'https://www.estebandalelr.co';
const APP_DIR = path.join(process.cwd(), 'app');

// Walk app/ for page files so new pages land in the sitemap on every build.
function collectRoutes(dir: string, segments: string[] = []): string[] {
  const routes: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const name = entry.name;
      // Skip private folders, parallel/intercepted routes and dynamic segments.
      if (name.startsWith('_') || name.startsWith('@') || name.startsWith('[')) continue;
      // Route groups like (tools) don't appear in the URL.
      const next = name.startsWith('(') ? segments : [...segments, name];
      routes.push(...collectRoutes(path.join(dir, name), next));
    } else if (/^page\.(tsx|ts|jsx|js|mdx)$/.test(entry.name)) {
      routes.push('/' + segments.join('/'));
    }
  }
  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return collectRoutes(APP_DIR)
    .sort()
    .map((route) => ({ url: route === '/' ? `${SITE}/` : `${SITE}${route}` }));
}
