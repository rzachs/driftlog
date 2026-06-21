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

## Phase status

**Built** — tooling/scaffold exists. **Validated** — exercised in a real workflow and confirmed working.

| # | Phase | Built | Validated |
|---|---|---|---|
| 1 | Requirements — Business rules | 🟡 partial | ⬜ |
| 2 | Feature specification | ✅ | ⬜ |
| 3 | Design → code | ✅ | ✅ |
| 4 | Spec-gated implementation | ✅ | ⬜ |
| 5 | Unit & integration tests | ✅ | ⬜ |
| 6 | E2E tests | ⬜ | ⬜ |
| 7 | Spec-aware code review | 🟡 partial | ⬜ |
| 8 | Documentation generation | ⬜ | ⬜ |
| 9 | CI/CD & deployment | ⬜ | ⬜ |
| 10 | Monitoring & maintenance | ⬜ | ⬜ |

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

**Status:** ✅ Done. 11 feature stubs created across 4 epics (`trips/`, `expenses/`, `balances/`, `settle-up/`), each following the user-story + AC template and referencing the relevant business-rules files. Spec gaps surfaced inline where the current code has undecided behaviour. Three-command pipeline defined and built: `/sdlc-spec` (draft spec → human approval) → `/sdlc-plan` (read spec + code → implementation + test plan → human approval) → `/sdlc-implement` (execute plan with idempotency check + test run).

---

### 3. Design → code
**Goal:** Designer pushes UI comps; AI translates visual changes into React code automatically.

**Approach:** Design comps live in `/design/` as `.dc.html` files synced from Claude Design (project ID in `.env` as `CLAUDE_DESIGN_PROJECT_ID`). The `/sync-app-design` skill fetches a comp, diffs it visually, and applies the structural/style changes to the corresponding `src/pages/*.jsx` file.

**AI role:** Translate design intent into code. Never change behavior — only structure and style.

**Status:** ✅ Done. `/sdlc-sync-app-design` fetches a comp, diffs it visually, and applies the structural/style changes to the corresponding `src/pages/*.jsx` file.

---

### 4. Spec-gated implementation
**Goal:** AI only writes logic for cases that exist in a spec table. No invented behavior.

**Approach:** Features flow through a three-command pipeline. Each command is a human-gated checkpoint — nothing proceeds without explicit approval.

```
/sdlc-spec <description>   → draft or update a feature spec → human approves
/sdlc-plan <spec-path>     → read spec + code, output implementation + test plan → human approves
/sdlc-implement <spec-path>→ execute plan (spec-gated code + tests + verify)
```

Before writing any logic, `sdlc-implement` cites the exact spec AC item or business-rules row it satisfies. If a case arises with no spec coverage, it surfaces the gap rather than guessing. Idempotency check runs first — re-running on an already-implemented feature is safe.

**AI role:** Implement exactly what specs say. Refuse to implement undecided cases. Surface gaps to the human.

**Status:** ✅ Done. Three-command pipeline built and live. The CLAUDE.md checklist remains as a fallback for ad-hoc changes made outside the pipeline.

---

### 5. Unit & integration tests
**Goal:** Business logic verified at the function level — fast, no browser, no server required.

**Approach:** Each row in a business-rules table → one test case. AI generates test stubs from the table; human adds any setup fixtures needed. Focus areas: `calculateBalances()`, `calculateSettlements()`, API route logic.

**Tool:** Vitest (already aligned with the Vite build setup).

**AI role:** Read a business-rules file, generate a test file with one `it()` per row. A failing test always cites the spec row it came from.

**Status:** ✅ Done. `calc.js` holds pure business-logic functions (`calculateBalancesFromData`, `calculateSettlementsFromBalances`); `db.js` are thin DB wrappers. `tests/balance-calculation.test.js` and `tests/settlement-calculation.test.js` cover every spec row with plain-array fixtures — no DB, no server required. 16 tests, all passing.

**Reusable command:** `/sdlc-generate-tests <spec-name>` — reads any `specs/business-rules/<spec-name>.md` file and generates the corresponding test file automatically.

---

### 6. E2E (End-to-End) tests
**Goal:** Browser-driven flows that verify the full stack — UI action → API → database → visible result.

**What E2E means:** A real browser opens, clicks buttons, fills forms, and asserts what appears on screen. It tests the entire chain from the user's perspective, which unit tests cannot catch (routing bugs, rendering failures, API wiring errors).

**Approach:** Each Given/When/Then in a feature file → one Playwright scenario. playwright-bdd wires `.feature` files under `specs/features/` to Playwright tests, keeping specs and tests in sync by design.

**Tool:** Playwright + playwright-bdd.

**AI role:** Generate `.feature` scenario stubs from feature spec AC. A failing E2E scenario always traces back to a specific feature file.

**Status:** ⬜ Not started. playwright-bdd setup deferred pending unit test phase.

---

### 7. Spec-aware code review
**Goal:** Code review that checks correctness *against specs*, not just code quality.

**Approach:** Extend the existing `/code-review` skill with a spec-aware mode: given the changed files, find the relevant spec files, and verify the implementation matches every referenced spec row. Flag rows that are not covered by any test.

**AI role:** Cross-reference implementation against spec tables. Surface mismatches and coverage gaps.

**Status:** 🟡 `/code-review` skill exists. Spec-aware mode not yet built.

---

### 8. Documentation generation
**Goal:** Docs that are always in sync with specs and code — because they're generated from them.

**Three targets:**
- **API docs** — derived from `server.js` route definitions (mechanical)
- **User-facing docs** — derived from `/specs/features/` user stories
- **Changelog** — derived from git commits + spec file diffs (which spec row changed → what user-visible behavior changed)

**AI role:** Generate docs on demand or as part of a release workflow. Docs are output, not source — never edit them directly.

**Status:** ⬜ Not started.

---

### 9. CI/CD & deployment
**Goal:** Automated gates that prevent a deploy if specs, tests, and docs are out of sync.

**Approach:**
- All spec-referenced tests must pass before deploy is allowed
- AI generates release notes from spec diffs (what rows changed between tags)
- Coverage gap detector: spec rows with no corresponding test block deploy

**AI role:** Release note generation, coverage gap detection, deployment validation.

**Status:** ⬜ Not started.

---

### 10. Monitoring & maintenance
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
| 1 | Unit & integration tests | Highest ROI; business-rules table row → test stub is near-mechanical |
| 2 | Spec-gated implementation enforcement | Locks the "no guessing" rule into the workflow |
| 3 | E2E tests | Layered on top of unit tests once specs are stable |
| 4 | Spec-aware code review | Extends an existing skill; catches drift between specs and code |
| 5 | Documentation generation | Straightforward once specs are stable |
| 6 | CI/CD integration | Ties the pipeline together; release notes from spec diffs |
| 7 | Monitoring / maintenance | Most speculative; requires production data to prove out |
