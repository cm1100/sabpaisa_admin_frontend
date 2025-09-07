#!/usr/bin/env node
/**
 * Codemod: Centralize UI imports via '@/components/ui'
 * - Moves supported imports from '@ant-design/pro-components' to UI hub
 * - Rewrites `import { Typography } from 'antd'` to UI hub
 * - Replaces `TextArea` usage with `CentralTextArea` and adds import
 *
 * Safe-by-default rules:
 * - Only relocates supported names: ProTable, ProColumns, ProCard, PageContainer, ActionType
 * - Leaves other pro-components imports intact
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TARGET_DIRS = ['app'];
const SUPPORTED_PRO_NAMES = new Set(['ProTable', 'ProColumns', 'ProCard', 'PageContainer', 'ActionType']);

const isTsx = (p) => p.endsWith('.tsx') || p.endsWith('.ts');

const readFile = (p) => fs.readFileSync(p, 'utf8');
const writeFile = (p, c) => fs.writeFileSync(p, c, 'utf8');

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
  // Merge into existing UI import or create a new one at the top
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
  // Insert after first import
  const firstImport = /import[^;]+;\s*/;
  const insert = `import { ${Array.from(new Set(names)).sort().join(', ')} } from '@/components/ui';\n`;
  if (firstImport.test(src)) return src.replace(firstImport, (s) => s + insert);
  return insert + src;
}

function transformFile(src) {
  let changed = false;

  // 1) Split pro-components import: move supported names to UI, keep others
  const proImportRe = /import\s*\{([^}]+)\}\s*from\s*['"]@ant-design\/pro-components['"];?/g;
  src = src.replace(proImportRe, (full, inner) => {
    const names = inner.split(',').map(s => s.trim()).filter(Boolean);
    const move = [];
    const keep = [];
    for (const n of names) {
      // handle alias: Name as Alias
      const base = n.split(/\s+as\s+/i)[0].trim();
      if (SUPPORTED_PRO_NAMES.has(base)) move.push(n); else keep.push(n);
    }
    if (move.length === 0) return full; // nothing to move
    changed = true;
    // ensure UI import for moved names
    src = ensureUiImport(move, src);
    if (keep.length) {
      return `import { ${keep.join(', ')} } from '@ant-design/pro-components';`;
    }
    return '';
  });

  // 2) Rewrite Typography import from antd to UI
  const typoRe = /import\s*\{\s*Typography\s*\}\s*from\s*['"]antd['"];?/g;
  if (typoRe.test(src)) {
    src = src.replace(typoRe, `import { Typography } from '@/components/ui';`);
    changed = true;
  }

  // 3) Replace TextArea with CentralTextArea
  const textAreaDestruct = /const\s*\{\s*TextArea\s*\}\s*=\s*Input\s*;/g;
  if (textAreaDestruct.test(src)) {
    src = src.replace(textAreaDestruct, '// Replaced by CentralTextArea');
    src = ensureUiImport(['CentralTextArea'], src);
    // Replace JSX tags <TextArea and </TextArea>
    src = src.replace(/<\s*TextArea\b/g, '<CentralTextArea');
    src = src.replace(/<\/\s*TextArea\s*>/g, '</CentralTextArea>');
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
    let content = readFile(f);
    const { src, changed } = transformFile(content);
    if (changed) {
      writeFile(f, src);
      modified++;
      process.stdout.write(`updated: ${path.relative(ROOT, f)}\n`);
    }
  }
  console.log(`Done. Modified ${modified} files.`);
}

if (process.argv[1]) run();
