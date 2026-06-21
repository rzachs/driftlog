# AI SDLC Plan — Driftlog

Driftlog is a testbed for **AI-augmented software development**. The app itself (a trip expense splitter) is a vehicle — the real experiment is mapping every phase of a standard SDLC to an AI workflow and proving each one out end-to-end.

## Core principle

```
Human intent
    ↓  (human writes)
Specs  (/specs/business-rules/ + /specs/features/)
    ↓  (AI reads, never writes without human review)
Design comps → Code → Tests → Docs → Release notes
```

Everything downstream is AI-generated *from* specs. Specs are the only place humans make decisions about behavior. If a case isn't in a spec table, it hasn't been decided — AI must not infer it.

---

## SDLC phases

### 1. Requirements — Business rules
**Goal:** Human-authored tables that are the single source of truth for every behavioral decision.

**Approach:** `/specs/business-rules/` holds one file per rule domain. Each file is a Markdown table: Scenario | Input | Expected output. Every row is a decided case. Undecided cases are simply absent.

**AI role:** Read before touching any logic. Flag when an implementation covers a case not in the table (potential spec gap). Never fill in the table autonomously.

**Status:** 🟡 Scaffold created. Convention enforced via 4-step CLAUDE.md checklist; hard tooling hook not yet built.

---

### 2. Feature specification
**Goal:** Structured feature files that link user stories to business rules and define acceptance criteria.

**Approach:** `/specs/features/` holds one file per feature. Each file follows the template: user story → AC (Given/When/Then) → business rules referenced → out of scope → edge cases (by reference, not re-stated).

**AI role:** Given a business rule file, draft AC stubs for human review. Never fill in feature files autonomously.

**Status:** 🟡 Scaffold created. Spec-to-story drafting workflow not yet defined.

---

### 3. Design → code
**Goal:** Designer pushes UI comps; AI translates visual changes into React code automatically.

**Approach:** Design comps live in `/design/` as `.dc.html` files synced from Claude Design (project `CLAUDE_DESIGN_PROJECT_ID`). The `/sync-app-design` skill fetches a comp, diffs it visually, and applies the structural/style changes to the corresponding `src/pages/*.jsx` file.

**AI role:** Translate design intent into code. Never change behavior — only structure and style.

**Status:** ✅ Done.

---

### 4. Spec-gated implementation
**Goal:** AI only writes logic for cases that exist in a spec table. No invented behavior.

**Approach:** Before implementing any feature or fixing any logic bug, AI must cite the relevant `/specs/business-rules/` row(s). If no row covers the case, AI surfaces the gap to the human rather than guessing.

**AI role:** Implement exactly what specs say. Refuse to implement undecided cases.

**Status:** 🟡 4-step pre-implementation checklist live in CLAUDE.md. Hard enforcement (hook that blocks without spec citation) not yet built.

---

### 5. Testing pipeline
**Goal:** Tests derived mechanically from specs — not invented, not duplicated from code.

**Approach (two layers):**
- **Unit/integration:** Each row in a business-rules table → one test case. AI generates test stubs from the table; human adds any setup fixtures needed.
- **E2E:** Each Given/When/Then in a feature file → one Playwright scenario. playwright-bdd wires `.feature` files to Playwright tests.

**AI role:** Generate test stubs from spec files. A failing test always traces back to a specific spec row.

**Status:** ⬜ Not started. playwright-bdd setup deferred.

---

### 6. Spec-aware code review
**Goal:** Code review that checks correctness *against specs*, not just code quality.

**Approach:** Extend the existing `/code-review` skill with a spec-aware mode: given the changed files, find the relevant spec files, and verify the implementation matches every referenced spec row. Flag rows that are not covered by any test.

**AI role:** Cross-reference implementation against spec tables. Surface mismatches and coverage gaps.

**Status:** 🟡 `/code-review` skill exists. Spec-aware mode not yet built.

---

### 7. Documentation generation
**Goal:** Docs that are always in sync with specs and code — because they're generated from them.

**Three targets:**
- **API docs** — derived from `server.js` route definitions (mechanical)
- **User-facing docs** — derived from `/specs/features/` user stories
- **Changelog** — derived from git commits + spec file diffs (which spec row changed → what user-visible behavior changed)

**AI role:** Generate docs on demand or as part of a release workflow. Docs are output, not source — never edit them directly.

**Status:** ⬜ Not started.

---

### 8. CI/CD & deployment
**Goal:** Automated gates that prevent a deploy if specs, tests, and docs are out of sync.

**Approach:**
- All spec-referenced tests must pass before deploy is allowed
- AI generates release notes from spec diffs (what rows changed between tags)
- Coverage gap detector: spec rows with no corresponding test block deploy

**AI role:** Release note generation, coverage gap detection, deployment validation.

**Status:** ⬜ Not started.

---

### 9. Monitoring & maintenance
**Goal:** Production errors classified by whether they represent a spec gap or a spec violation.

**Approach:** When a bug is filed, AI checks whether the failing case exists in any business-rules table.
- If yes → spec violation (we decided this and implemented it wrong).
- If no → spec gap (nobody decided this case; it needs a spec row before a fix is written).

This makes the spec system self-correcting: every production bug is either a missing spec row or a broken implementation of an existing one.

**AI role:** Bug triage, spec gap detection, routing bugs to the right fix workflow.

**Status:** ⬜ Not started.

---

## Recommended build order

| Priority | Phase | Why |
|---|---|---|
| 1 | Testing pipeline | Highest ROI; business-rules table row → test stub is near-mechanical |
| 2 | Spec-gated implementation enforcement | Locks the "no guessing" rule into the workflow |
| 3 | Spec-aware code review | Extends an existing skill; catches drift between specs and code |
| 4 | Documentation generation | Straightforward once specs are stable |
| 5 | CI/CD integration | Ties the pipeline together; release notes from spec diffs |
| 6 | Monitoring / maintenance | Most speculative; requires production data to prove out |
