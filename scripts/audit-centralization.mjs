#!/usr/bin/env node
/**
 * Audit centralization of UI imports, colors, and fonts across the repo.
 *
 * Checks:
 * 1) Direct imports from 'antd' / '@ant-design/pro-components' / '@ant-design/pro-layout'
 *    outside the allowed hubs (components/ui/**).
 * 2) Hard-coded color literals (hex and common named colors) in code/styles
 *    outside the allowed theme locations.
 * 3) font-family declarations not using CSS variables (heuristic).
 *
 * Usage:
 *   node scripts/audit-centralization.mjs [--format text|json] [--no-exit]
 *
 * Exit code:
 *   0 on success (no findings), 1 if findings exist (unless --no-exit is provided)
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

// CLI options
const args = new Set(process.argv.slice(2));
const FORMAT = args.has('--format=json') ? 'json' : 'text';
const NO_EXIT = args.has('--no-exit');

// File globs to scan
const ALLOWED_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.scss']);

// Directories to ignore during traversal
const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'test-results',
  'tests',
  '__tests__',
  '.turbo',
  'scripts',
  'services',
]);

// Files/dirs where hex/named colors are allowed (theme sources, assets, docs)
const COLOR_ALLOWLIST_PATHS = [
  'app/globals.css',
  'styles/',
  'public/', // assets (svgs)
];

// Files/dirs where direct antd/pro imports are allowed
const ANTD_IMPORT_ALLOWLIST_DIRS = [
  'components/ui/', // central UI wrappers and hub may import from antd/pro
];

// Basic color detection patterns
const HEX_COLOR_RE = /(^|[^\w])#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\w])/g;
const NAMED_COLORS = [
  'black','white','red','blue','green','gray','grey','orange','purple','pink','yellow',
  'cyan','magenta','brown','teal','indigo','violet','silver','gold','navy','maroon',
  'olive','lime','aqua','fuchsia'
];
// Match named colors only when used as string literals: 'red' or "red"
const NAMED_COLOR_RE = new RegExp(
  String.raw`(['"])\s*(?:${NAMED_COLORS.join('|')})\s*\1`,
  'gi'
);

// Properties to scrutinize for colors in code/CSS
const COLOR_PROP_RE = /\b(color|background|backgroundColor|borderColor|fill|stroke)\b\s*[:=]/i;

// font-family heuristic: flag when value lacks CSS var usage
const FONT_FAMILY_RE = /font-family\s*[:=]\s*[^;\n}]+/gi;
const FONT_VAR_HINT_RE = /var\(\s*--font-|var\(\s*--font-family-/i;

// Direct import detection
const ANTD_IMPORT_RE = /from\s+['"](antd|@ant-design\/pro-components|@ant-design\/pro-layout)['"];?/;

function isPathUnder(file, prefix) {
  const abs = path.resolve(file);
  const pre = path.resolve(prefix);
  return abs === pre || abs.startsWith(pre + path.sep);
}

function isAllowedColorFile(filePath) {
  const rel = path.relative(ROOT, filePath);
  return COLOR_ALLOWLIST_PATHS.some((p) => {
    return rel === p || rel.startsWith(p);
  });
}

function isAllowedAntdImportFile(filePath) {
  const rel = path.relative(ROOT, filePath);
  return ANTD_IMPORT_ALLOWLIST_DIRS.some((p) => rel.startsWith(p));
}

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      files = walk(full, files);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (!ALLOWED_EXT.has(ext)) continue;
      // ignore some generated/build artifacts
      if (entry.name.endsWith('.d.ts') || entry.name.endsWith('.map')) continue;
      files.push(full);
    }
  }
  return files;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(ROOT, filePath);
  const findings = [];

  // 1) Direct antd/pro imports
  const lines = content.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (ANTD_IMPORT_RE.test(line)) {
      // allow type-only imports (e.g., import type { X } from '...')
      if (/^\s*import\s+type\s+\{/.test(line)) return;
      if (!isAllowedAntdImportFile(filePath)) {
        findings.push({
          type: 'direct-import',
          line: i + 1,
          text: line.trim(),
          rule: "Import 'antd' or '@ant-design/*' must go through components/ui/",
        });
      }
    }
  });

  // 2) Hard-coded colors (hex or named) near color-like properties
  if (!isAllowedColorFile(filePath)) {
    lines.forEach((line, i) => {
      if (COLOR_PROP_RE.test(line)) {
        // Skip color attributes on Tag/CentralTag components; centralized wrapper handles mapping
        const isTagColorAttr = /<\/?\s*(Tag|CentralTag|Timeline\.Item)[^>]*\bcolor\s*=/.test(line);
        if (isTagColorAttr) return;
        const hexMatches = [...line.matchAll(HEX_COLOR_RE)];
        const namedMatches = /var\(/.test(line) ? [] : [...line.matchAll(NAMED_COLOR_RE)];
        if (hexMatches.length > 0) {
          findings.push({
            type: 'color-literal-hex',
            line: i + 1,
            text: line.trim(),
            rule: 'Use CSS variables or theme tokens instead of hex colors',
          });
        }
        if (namedMatches.length > 0) {
          findings.push({
            type: 'color-literal-named',
            line: i + 1,
            text: line.trim(),
            rule: 'Use CSS variables or AntD semantic statuses instead of named colors',
          });
        }
      }
    });

    // also scan entire file for hex color literals to catch cases without explicit property (e.g., ECharts configs)
    // but keep it conservative: only flag when not in a comment-only line
    lines.forEach((line, i) => {
      const stripped = line.trim();
      if (stripped.startsWith('//') || stripped.startsWith('/*') || stripped.startsWith('*')) return;
      const isTagColorAttr = /<\/?\s*(Tag|CentralTag|Timeline\.Item)[^>]*\bcolor\s*=/.test(line);
      if (isTagColorAttr) return;
      const hexMatches = [...line.matchAll(HEX_COLOR_RE)];
      // Skip named colors when used within CSS variables var(--...)
      const namedMatches = /var\(/.test(line) ? [] : [...line.matchAll(NAMED_COLOR_RE)];
      if (hexMatches.length > 0) {
        findings.push({
          type: 'color-literal-hex',
          line: i + 1,
          text: line.trim(),
          rule: 'Use CSS variables or theme tokens instead of hex colors',
        });
      }
      if (namedMatches.length > 0 && COLOR_PROP_RE.test(line)) {
        findings.push({
          type: 'color-literal-named',
          line: i + 1,
          text: line.trim(),
          rule: 'Use CSS variables or AntD semantic statuses instead of named colors',
        });
      }
    });
  }

  // 3) font-family heuristic: if present and no var(--font-*) used
  if (!rel.endsWith('.svg')) {
    const ffMatches = content.match(FONT_FAMILY_RE) || [];
    for (const m of ffMatches) {
      if (!FONT_VAR_HINT_RE.test(m)) {
        const idx = content.indexOf(m);
        const line = content.slice(0, idx).split(/\r?\n/).length;
        findings.push({
          type: 'font-family-literal',
          line,
          text: m.trim(),
          rule: 'Prefer font variables (var(--font-…)) for font-family',
        });
      }
    }
  }

  // 4) Gradient usage without Surface or gradient context
  const gradientMatches = content.match(/var\(\s*--color-gradient-[^)]+\)/g) || [];
  const bgGradientMatches = content.match(/var\(\s*--color-bg-gradient\s*\)/g) || [];
  if (gradientMatches.length > 0) {
    const hasSurfaceImport = content.includes("components/theme/Surface");
    const hasSurfaceClass = /surface-gradient|on-gradient|on-primary/.test(content);
    const hasResponsiveGradient = /background\s*=\s*["']gradient["']/g.test(content);
    if (!hasSurfaceImport && !hasSurfaceClass && !hasResponsiveGradient) {
      findings.push({
        type: 'gradient-without-surface',
        line: 1,
        text: 'Gradient background found without Surface/on-gradient context',
        rule: 'Wrap gradient sections with <Surface type="gradient"/> or add on-gradient class/context',
      });
    }
  }
  if (bgGradientMatches.length > 0) {
    const hasSurfaceImport = content.includes("components/theme/Surface");
    const hasSurfaceClass = /surface-gradient|on-gradient|on-primary/.test(content);
    const hasResponsiveGradient = /background\s*=\s*["']gradient["']/g.test(content);
    if (!hasSurfaceImport && !hasSurfaceClass && !hasResponsiveGradient) {
      findings.push({
        type: 'bg-gradient-without-surface',
        line: 1,
        text: 'Background gradient found without Surface/on-gradient context',
        rule: 'Wrap gradient sections with <Surface type="gradient"/> or add on-gradient class/context',
      });
    }
  }

  return findings.length ? { file: rel, findings } : null;
}

function main() {
  const files = walk(ROOT, []);
  const results = [];

  for (const file of files) {
    // Skip non-project files
    const rel = path.relative(ROOT, file);
    if (rel.startsWith('public/')) continue; // assets are excluded from audit
    if (rel.endsWith('.md')) continue;

    // Ignore known safe files
    if (rel.endsWith('components/ui/CentralButton.tsx')) continue;
    if (rel.endsWith('.css')) continue;
    const res = scanFile(file);
    if (res && res.findings.length) {
      results.push(res);
    }
  }

  const summary = {
    totalFilesScanned: files.length,
    filesWithFindings: results.length,
    totalFindings: results.reduce((n, r) => n + r.findings.length, 0),
  };

  if (FORMAT === 'json') {
    console.log(JSON.stringify({ summary, results }, null, 2));
  } else {
    console.log('=== Centralization Audit Report ===');
    console.log(`Scanned files: ${summary.totalFilesScanned}`);
    console.log(`Files with findings: ${summary.filesWithFindings}`);
    console.log(`Total findings: ${summary.totalFindings}`);
    console.log('');
    for (const r of results) {
      console.log(`- ${r.file}`);
      for (const f of r.findings) {
        console.log(`  [${f.type}] line ${f.line}: ${f.text}`);
        console.log(`    -> ${f.rule}`);
      }
    }
    if (results.length === 0) {
      console.log('No issues found. ✅');
    }
  }

  if (!NO_EXIT) {
    process.exit(results.length > 0 ? 1 : 0);
  }
}

main();
