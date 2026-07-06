/**
 * Google Translate integration.
 *
 * UML check: no dedicated TranslationCache table exists in the schema
 * (DC-10 only has LanguageConfig). Per project decision, translations are
 * cached in the browser via localStorage — no server-side cache for now.
 * The day a `TranslationCache` table is added, extend `getCached` /
 * `setCached` to hit the API before falling back to localStorage.
 *
 * Endpoint: the "widget" free endpoint of Google Translate. No API key
 * required, but rate-limited. Perfectly adequate for a public landing
 * page whose content rarely changes.
 */

const ENDPOINT = 'https://translate.googleapis.com/translate_a/single';
const CACHE_KEY = 'moledi_tx_cache_v1';
const BATCH_SEPARATOR = '\n||\n';
const MAX_CHARS_PER_BATCH = 3500;

let memoryCache = null;

function loadCache() {
  if (memoryCache) return memoryCache;
  try {
    memoryCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    memoryCache = {};
  }
  return memoryCache;
}

function persistCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
  } catch {
    /* quota exceeded — silently drop */
  }
}

const key = (from, to, text) => `${from}|${to}|${text}`;

export function getCached(from, to, text) {
  return loadCache()[key(from, to, text)];
}

export function setCached(from, to, text, translation) {
  loadCache()[key(from, to, text)] = translation;
  persistCache();
}

/**
 * Translate a batch of strings. Returns an array of translations in the same
 * order, using cache when possible and Google Translate for cache misses.
 */
export async function translateBatch(strings, from = 'fr', to = 'en') {
  const results = new Array(strings.length);
  const misses = [];
  const missIndices = [];

  strings.forEach((s, i) => {
    if (!s || !s.trim()) {
      results[i] = s;
      return;
    }
    const cached = getCached(from, to, s);
    if (cached !== undefined) {
      results[i] = cached;
    } else {
      misses.push(s);
      missIndices.push(i);
    }
  });

  // Chunk misses so we stay under URL-length limits.
  const chunks = [];
  let current = [];
  let currentSize = 0;
  for (const s of misses) {
    if (currentSize + s.length > MAX_CHARS_PER_BATCH && current.length) {
      chunks.push(current);
      current = [];
      currentSize = 0;
    }
    current.push(s);
    currentSize += s.length;
  }
  if (current.length) chunks.push(current);

  let missOffset = 0;
  for (const chunk of chunks) {
    const joined = chunk.join(BATCH_SEPARATOR);
    try {
      const url =
        `${ENDPOINT}?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(joined)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Google returns [[[translated, original, ...], ...], ...]
      const translated = (data[0] || [])
        .map((seg) => seg[0])
        .join('')
        .split(BATCH_SEPARATOR);
      chunk.forEach((source, i) => {
        const dst = translated[i] ?? source;
        setCached(from, to, source, dst);
        results[missIndices[missOffset + i]] = dst;
      });
    } catch (e) {
      // On failure, keep source text so the page stays usable.
      chunk.forEach((source, i) => {
        results[missIndices[missOffset + i]] = source;
      });
      // eslint-disable-next-line no-console
      console.warn('[translate] batch failed:', e);
    }
    missOffset += chunk.length;
  }

  return results;
}

/**
 * Walk the DOM and translate every visible text node inside the given root.
 * Original texts are remembered on the node so switching back to source
 * language restores instantly with no API call.
 *
 * SKIPS: <script>, <style>, <noscript>, elements marked with
 * `data-no-translate`, and elements inside form inputs.
 */
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME']);
const ORIGINAL = Symbol('moledi.originalText');

function collectTextNodes(root) {
  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
      if (p.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
      const t = node.nodeValue;
      if (!t || !t.trim()) return NodeFilter.FILTER_REJECT;
      // ignore pure numbers / prices
      if (/^[\s\d.,€$%–—-]+$/.test(t)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  return nodes;
}

export async function translatePage(root, from, to) {
  if (from === to) return restoreOriginal(root);
  const nodes = collectTextNodes(root);
  const originals = nodes.map((n) => {
    if (n[ORIGINAL] === undefined) n[ORIGINAL] = n.nodeValue;
    return n[ORIGINAL];
  });
  const translations = await translateBatch(originals, from, to);
  nodes.forEach((n, i) => {
    n.nodeValue = translations[i];
  });
}

export function restoreOriginal(root) {
  const nodes = collectTextNodes(root);
  nodes.forEach((n) => {
    if (n[ORIGINAL] !== undefined) n.nodeValue = n[ORIGINAL];
  });
}
