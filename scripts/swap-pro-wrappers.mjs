#!/usr/bin/env node
/**
 * Codemod: Swap Pro components to central wrappers
 * - Replace ProTable -> CentralProTable
 * - Replace PageContainer -> CentralPageContainer
 * - Ensure imports from '@/components/ui' include central wrappers
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TARGET_DIRS = ['app'];

const isTsx = (p) => p.endsWith('.tsx') || p.endsWith('.ts');
const read = (p) => fs.readFileSync(p, 'utf8');
const write = (p, c) => fs.writeFileSync(p, c, 'utf8');

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.next') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function ensureUiImport(names, src) {
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]@\/components\/ui['"];?/g;
  let found = false;
  src = src.replace(importRegex, (full, inner) => {
    found = true;
    const existing = inner.split(',').map(s => s.trim()).filter(Boolean);
    const set = new Set(existing);
    names.forEach(n => set.add(n));
    return `import { ${Array.from(set).sort().join(', ')} } from '@/components/ui';`;
  });
  if (found) return src;
  const firstImport = /import[^;]+;\s*/;
  const insert = `import { ${Array.from(new Set(names)).sort().join(', ')} } from '@/components/ui';\n`;
  if (firstImport.test(src)) return src.replace(firstImport, (s) => s + insert);
  return insert + src;
}

function transform(src) {
  let changed = false;
  // Skip transformation in UI index or wrappers
  if (/components\/ui\//.test(src)) return { src, changed };

  // Replace JSX tags; be careful to not touch Central already
  if (/<\s*ProTable\b/.test(src)) {
    src = src.replace(/<\s*ProTable\b/g, '<CentralProTable');
    src = src.replace(/<\/\s*ProTable\s*>/g, '</CentralProTable>');
    src = ensureUiImport(['CentralProTable'], src);
    changed = true;
  }
  if (/<\s*PageContainer\b/.test(src)) {
    src = src.replace(/<\s*PageContainer\b/g, '<CentralPageContainer');
    src = src.replace(/<\/\s*PageContainer\s*>/g, '</CentralPageContainer>');
    src = ensureUiImport(['CentralPageContainer'], src);
    changed = true;
  }
  return { src, changed };
}

function run() {
  const files = [];
  for (const d of TARGET_DIRS) {
    const dir = path.join(ROOT, d);
    if (fs.existsSync(dir)) files.push(...walk(dir));
  }
  const targets = files.filter(f => isTsx(f));
  let modified = 0;
  for (const f of targets) {
    const content = read(f);
    const { src, changed } = transform(content);
    if (changed) {
      write(f, src);
      modified++;
      process.stdout.write(`wrapped: ${path.relative(ROOT, f)}\n`);
    }
  }
  console.log(`Done. Wrapped ${modified} files.`);
}

if (process.argv[1]) run();
