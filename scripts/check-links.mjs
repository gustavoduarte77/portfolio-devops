import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { parse } from 'parse5';

const root = process.cwd();
const origin = 'https://portfolio.invalid';
const base = new URL('/site/', origin);
const documents = new Map();
const remoteChecks = new Map();

async function loadHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === '_site') continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await loadHtml(path);
    if (entry.isFile() && entry.name.endsWith('.html')) {
      documents.set(path, parse(await readFile(path, 'utf8')));
    }
  }
}

function* elements(node) {
  if (node.tagName) yield node;
  for (const child of node.childNodes ?? []) yield* elements(child);
  if (node.content) yield* elements(node.content);
}

async function checkRemote(url) {
  try {
    let response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(12000) });
    if (!response.ok) {
      response = await fetch(url, { signal: AbortSignal.timeout(12000) });
      await response.body?.cancel();
    }
    return response.ok ? null : `HTTP ${response.status}`;
  } catch (error) {
    return error.message;
  }
}

async function checkReference(value, source, tag) {
  if (!value?.trim()) return 'referência vazia';
  const url = new URL(value, source);
  if (tag === 'a' && url.protocol === 'mailto:') {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(decodeURIComponent(url.pathname)) ? null : 'e-mail inválido';
  }
  if (tag === 'a' && url.protocol === 'tel:') {
    return /^\+?[0-9(). -]+$/.test(decodeURIComponent(url.pathname)) ? null : 'telefone inválido';
  }
  if (!['http:', 'https:'].includes(url.protocol)) return 'protocolo inválido';

  if (url.origin !== origin) {
    url.hash = '';
    if (!remoteChecks.has(url.href)) remoteChecks.set(url.href, checkRemote(url));
    return remoteChecks.get(url.href);
  }

  if (!url.pathname.startsWith(base.pathname)) return 'caminho fora da pasta publicada';
  let path = resolve(root, decodeURIComponent(url.pathname.slice(base.pathname.length)));
  if (path !== root && !path.startsWith(root + sep)) return 'caminho fora do projeto';

  if ((await stat(path)).isDirectory()) {
    path = resolve(path, 'index.html');
  }
  if (!(await stat(path)).isFile()) return 'arquivo inválido';

  if (url.hash && documents.has(path)) {
    const anchor = decodeURIComponent(url.hash.slice(1));
    const found = [...elements(documents.get(path))].some(node =>
      node.attrs.some(attr => (attr.name === 'id' || (node.tagName === 'a' && attr.name === 'name')) && attr.value === anchor)
    );
    if (!found) return 'âncora inexistente';
  }
  return null;
}

await loadHtml(root);
const checks = [];
for (const [path, document] of documents) {
  const relative = path.slice(root.length + 1).split(sep).join('/');
  const source = new URL(relative.split('/').map(encodeURIComponent).join('/'), base);
  for (const node of elements(document)) {
    const key = { a: 'href', area: 'href', link: 'href', img: 'src' }[node.tagName];
    if (!key) continue;
    const attr = node.attrs.find(item => item.name === key);
    if (!attr && !['img', 'link'].includes(node.tagName)) continue;
    const values = [attr?.value];
    const srcset = node.attrs.find(item => item.name === 'srcset');
    if (srcset) values.push(...srcset.value.trim().split(/\s*,\s*/).map(item => item.split(/\s+/)[0]));
    for (const value of values) {
      checks.push((async () => {
        try {
          const problem = await checkReference(value, source, node.tagName);
          if (problem) throw new Error(problem);
        } catch (error) {
          const reason = error.code === 'ENOENT' ? 'arquivo inexistente' : error.message;
          return `${relative}: <${node.tagName}> "${value ?? ''}" — ${reason}`;
        }
      })());
    }
  }
}
const errors = (await Promise.all(checks)).filter(Boolean);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`${checks.length} referências verificadas.`);
}
