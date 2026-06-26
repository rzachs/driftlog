#!/usr/bin/env node
// Spec-coverage enforcement (step 10b).
//
// Check 1 — Unit test [row N] coverage
//   For each tests/*.test.js that has a "// spec: <path>" header, every row in
//   the referenced business-rules table must have a "[row N]" citation in an
//   it() description.  Rows explicitly acknowledged with a
//   "// Rows N & M ... — not covered here" comment are skipped.
//
// Check 2 — E2E scenario count >= AC item count
//   For each specs/features/**/*.md that has an "## Acceptance criteria"
//   section, the matching e2e/features/**/*.feature must have at least as many
//   non-@wip scenarios as AC items.  Scenarios annotated "[AC: X + Y]" count
//   as two ACs; "[AC: X + Y + Z]" counts as three, etc.
//
// Exits 1 if any gap is found; 0 if all covered.
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let gaps = 0;

function fail(msg) { console.error('  ✗ ' + msg); gaps++; }
function ok(msg)   { console.log ('  ✓ ' + msg); }

// ── File helpers ──────────────────────────────────────────────────────────────

function findFiles(dir, ext) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findFiles(p, ext));
    else if (entry.name.endsWith(ext) && !entry.name.startsWith('_')) out.push(p);
  }
  return out;
}

// ── Spec parsers ──────────────────────────────────────────────────────────────

// Count data rows in the first "| Scenario | Input | Expected output |" table.
function countTableRows(content) {
  const lines = content.split('\n');
  let inTable = false;
  let count = 0;
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith('|')) { if (inTable) break; continue; }
    if (/\|[-: ]+\|/.test(t) && /---/.test(t)) continue; // separator row
    if (/scenario/i.test(t) && /input/i.test(t)) { inTable = true; continue; } // header
    if (inTable) count++;
  }
  return count;
}

// Count bullet items in the "## Acceptance criteria" section.
function countACItems(content) {
  const m = content.match(/## Acceptance criteria\r?\n([\s\S]*?)(?=\r?\n## |\r?\n---)/);
  if (!m) return 0;
  return (m[1].match(/^- /mg) || []).length;
}

// Collect [row N] numbers cited in a test file.
function extractRowCitations(content) {
  const cited = new Set();
  for (const m of content.matchAll(/\[row (\d+)\]/g)) cited.add(+m[1]);
  return cited;
}

// Collect row numbers explicitly acknowledged as not covered in unit tests.
// Recognises: "// Rows 7 & 8 ... — not covered here"
//             "// Row 7 ... — not covered here"
function extractSkippedRows(content) {
  const skipped = new Set();
  for (const m of content.matchAll(/\/\/ Rows? ([\d ,&]+)[^—\n]*—[^n]*not covered/gi)) {
    for (const n of m[1].matchAll(/\d+/g)) skipped.add(+n[0]);
  }
  return skipped;
}

// Count non-@wip scenarios and total AC coverage.
// Scenarios annotated "[AC: X + Y]" count as 2 ACs; "[AC: X + Y + Z]" as 3, etc.
// Unannotated scenarios each count as 1.
function countNonWipScenarioCoverage(content) {
  const lines = content.split('\n');
  let coverage = 0;
  let lastTag  = '';
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('@')) { lastTag = t; continue; }
    if (/^Scenario( Outline)?:/.test(t)) {
      if (!lastTag.includes('@wip')) {
        const acAnnotation = t.match(/\[AC:([^\]]+)\]/);
        if (acAnnotation) {
          // Count "+" separated items as separate ACs
          coverage += acAnnotation[1].split('+').length;
        } else {
          coverage += 1;
        }
      }
      lastTag = '';
      continue;
    }
    if (t && !t.startsWith('#')) lastTag = '';
  }
  return coverage;
}

// ── Check 1: [row N] coverage in unit tests ───────────────────────────────────

console.log('\nUnit test [row N] coverage');
console.log('─'.repeat(50));

for (const testFile of findFiles(path.join(ROOT, 'tests'), '.test.js')) {
  const content  = fs.readFileSync(testFile, 'utf8');
  const specLine = content.match(/\/\/ spec: (.+\.md)/);
  if (!specLine) continue;

  const specPath = path.resolve(ROOT, specLine[1].trim());
  const relTest  = path.relative(ROOT, testFile);
  const relSpec  = path.relative(ROOT, specPath);

  if (!fs.existsSync(specPath)) {
    fail(`${relTest} references ${relSpec} but the file does not exist`);
    continue;
  }

  const rowCount = countTableRows(fs.readFileSync(specPath, 'utf8'));
  const cited    = extractRowCitations(content);
  const skipped  = extractSkippedRows(content);
  let allCovered = true;

  for (let i = 1; i <= rowCount; i++) {
    if (skipped.has(i)) continue; // acknowledged as UI/E2E-only
    if (!cited.has(i)) {
      fail(`${relSpec} row ${i} — no [row ${i}] citation in ${relTest}`);
      allCovered = false;
    }
  }
  if (allCovered) {
    const note = skipped.size ? ` (${skipped.size} row(s) acknowledged as E2E-only)` : '';
    ok(`${relSpec} — all rows cited in ${relTest}${note}`);
  }
}

// ── Check 2: E2E scenario coverage >= AC item count ───────────────────────────

console.log('\nE2E scenario coverage');
console.log('─'.repeat(50));

for (const specFile of findFiles(path.join(ROOT, 'specs', 'features'), '.md')) {
  const content = fs.readFileSync(specFile, 'utf8');
  const acCount = countACItems(content);
  if (acCount === 0) continue;

  const relSpec     = path.relative(ROOT, specFile);
  const featurePath = path.join(
    ROOT, 'e2e', 'features',
    path.relative(path.join(ROOT, 'specs', 'features'), specFile).replace('.md', '.feature'),
  );
  const relFeature  = path.relative(ROOT, featurePath);

  if (!fs.existsSync(featurePath)) {
    fail(`${relSpec} has ${acCount} AC items but ${relFeature} does not exist`);
    continue;
  }

  const coverage = countNonWipScenarioCoverage(fs.readFileSync(featurePath, 'utf8'));
  if (coverage < acCount) {
    fail(`${relSpec} has ${acCount} AC items but only ${coverage} scenario-AC(s) in ${relFeature}`);
  } else {
    ok(`${relFeature} — ${coverage} scenario-AC(s) ≥ ${acCount} AC items`);
  }
}

// ── Result ────────────────────────────────────────────────────────────────────

console.log('');
if (gaps > 0) {
  console.error(`❌  ${gaps} coverage gap(s) found — add missing tests or spec rows before merging.`);
  process.exit(1);
} else {
  console.log('✅  All spec rows and AC items are covered.');
  process.exit(0);
}
