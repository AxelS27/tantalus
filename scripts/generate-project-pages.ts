import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { allProjectsData } from '../src/data/projects';

const origin = 'https://www.liemaxels.com';
const mediaOrigin = 'https://media.liemaxels.com';
const output = 'dist';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

function replaceTag(html: string, selector: string, replacement: string): string {
  if (!html.includes(selector)) throw new Error(`Missing metadata marker: ${selector}`);
  return html.replace(selector, replacement);
}

const template = await readFile(join(output, 'index.html'), 'utf8');
const urls = [origin + '/'];

for (const project of allProjectsData) {
  if (!/^[a-z0-9-]+$/.test(project.id)) throw new Error(`Invalid project id: ${project.id}`);
  const url = `${origin}/projects/${project.id}`;
  const title = `${project.title} | Farrell Axel Suwandi`;
  const image = `${mediaOrigin}${project.thumbnail}`;
  const description = project.description;
  let html = replaceTag(template, '<title>Farrell Axel Suwandi | AI Researcher &amp; Software Engineer</title>', `<title>${escapeHtml(title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  );
  const tags: Array<[string, string]> = [
    ['<link rel="canonical" href="https://www.liemaxels.com/" />', `<link rel="canonical" href="${url}" />`],
    ['<meta property="og:type" content="website" />', '<meta property="og:type" content="article" />'],
    ['<meta property="og:title" content="Farrell Axel Suwandi | AI Researcher &amp; Software Engineer" />', `<meta property="og:title" content="${escapeHtml(title)}" />`],
    ['<meta property="og:description" content="Farrell Axel Suwandi is an AI researcher and software engineer based in Jakarta. He enjoys playing piano, coding, and watching movies." />', `<meta property="og:description" content="${escapeHtml(description)}" />`],
    ['<meta property="og:url" content="https://www.liemaxels.com/" />', `<meta property="og:url" content="${url}" />`],
    ['<meta property="og:image" content="https://media.liemaxels.com/images/tantalize/home.webp" />', `<meta property="og:image" content="${escapeHtml(image)}" />`],
    ['<meta name="twitter:title" content="Farrell Axel Suwandi | AI Researcher &amp; Software Engineer" />', `<meta name="twitter:title" content="${escapeHtml(title)}" />`],
    ['<meta name="twitter:description" content="Farrell Axel Suwandi is an AI researcher and software engineer based in Jakarta. He enjoys playing piano, coding, and watching movies." />', `<meta name="twitter:description" content="${escapeHtml(description)}" />`],
    ['<meta name="twitter:image" content="https://media.liemaxels.com/images/tantalize/home.webp" />', `<meta name="twitter:image" content="${escapeHtml(image)}" />`],
  ];
  for (const [marker, replacement] of tags) html = replaceTag(html, marker, replacement);
  // The Home LCP preload would download an unrelated image on a project deep link.
  html = html.replace(/    <link rel="preload" as="image"[^\n]*\n/, '');
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'CreativeWork',
    name: project.title, description, image, url,
    author: { '@type': 'Person', name: 'Farrell Axel Suwandi' },
  };
  html = html.replace('</head>', `    <script id="project-jsonld" type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>\n  </head>`);
  await mkdir(join(output, 'projects', project.id), { recursive: true });
  await writeFile(join(output, 'projects', project.id, 'index.html'), html);
  urls.push(url);
}

await writeFile(join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Generated ${allProjectsData.length} project previews and sitemap`);
