// Cloudflare Pages Function: Markdown for Agents.
// Requests with Accept: text/markdown get the pre-built .md copy of the page
// (see scripts/build-markdown.mjs). Browsers keep getting HTML.

function markdownPath(pathname) {
  let p = pathname.replace(/\/+$/, '');
  if (p === '' || p === '/index' || p === '/index.html') return '/index.md';
  if (p.endsWith('.html')) return p.slice(0, -5) + '.md';
  if (/\.[a-z0-9]+$/i.test(p.split('/').pop())) return null; // other files
  return p + '.md';
}

export async function onRequest({ request, env, next }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return next();

  const url = new URL(request.url);
  const wantsMarkdown = /(^|,)\s*text\/markdown/i.test(request.headers.get('Accept') || '');
  const mdPath = wantsMarkdown ? markdownPath(url.pathname) : null;

  if (mdPath) {
    const asset = await env.ASSETS.fetch(new URL(mdPath, url));
    if (asset.ok) {
      const text = await asset.text();
      return new Response(request.method === 'HEAD' ? null : text, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept',
          // Rough estimate (~4 characters per token).
          'x-markdown-tokens': String(Math.ceil(text.length / 4)),
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      });
    }
  }

  const response = await next();
  if ((response.headers.get('Content-Type') || '').includes('text/html')) {
    const withVary = new Response(response.body, response);
    withVary.headers.append('Vary', 'Accept');
    return withVary;
  }
  return response;
}
