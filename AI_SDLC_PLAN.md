# AI SDLC Plan — Driftlog

Driftlog is a testbed for **AI-augmented software development**. The app itself (a trip expense splitter) is a vehicle — the real experiment is mapping every phase of a standard SDLC to an AI workflow and proving each one out end-to-end.

## Core principle

```
Human intent
    ↓  (human writes)
Specs  (/specs/features/ + /specs/business-rules/)
    ↓  (AI reads, never writes without human review)
Design comps → Code → Tests → Docs → Release notes
```

Everything downstream is AI-generated *from* specs. Specs are the only place humans make decisions about behavior. If a case isn't in a spec table, it hasn't been decided — AI must not infer it.

---

## Phase status

**Built** — tooling/scaffold exists. **Validated** — exercised in a real workflow and confirmed working.

| # | Phase | Built | Validated |
|---|---|---|---|
| 1 | Feature specification | ✅ | ⬜ |
| 2 | Business rules | ✅ | ⬜ |
| 3 | Design → code | ✅ | ✅ |
| 4 | Implementation | ✅ | ⬜ |
| 5 | Unit tests | ✅ | ✅ |
| 6 | E2E tests | ✅ | ✅ |
| 7 | Spec-aware code review | 🟡 partial | ⬜ |
| 8 | Documentation generation | ⬜ | ⬜ |
| 9 | CI/CD & deployment | ⬜ | ⬜ |
| 10 | Monitoring & maintenance | ⬜ | ⬜ |

---

## SDLC phases

### 1. Feature specification
**Goal:** Structured feature files that capture what is being built — user stories, acceptance criteria, and scope boundaries.

**Approach:** `/specs/features/` holds one file per feature. Each file follows the template: user story → AC (Given/When/Then) → business rules referenced → out of scope → edge cases (by reference, not re-stated). Features are defined first, at a high level; business rules (Phase 2) detail the logic within them.

**Tool:** `/sdlc-spec <description>` — takes a plain-English description, auto-detects whether it's a new feature or an update to an existing one, drafts the spec file, and waits for human approval before writing anything. On approval, instructs you to proceed to Phase 4 with `/sdlc-plan`.

**AI role:** Draft spec stubs from plain English. Never fill in feature files autonomously. Never proceed to implementation — that's Phase 4.

**Status:** ✅ Done. 11 feature stubs created across 4 epics (`trips/`, `expenses/`, `balances/`, `settle-up/`), each following the user-story + AC template and referencing the relevant business-rules files. Spec gaps surfaced inline where the current code has undecided behaviour.

---

### 2. Business rules
**Goal:** Human-authored decision tables that are the single source of truth for every behavioural edge case within a feature.

**Approach:** `/specs/business-rules/` holds one file per rule domain. Each file is a Markdown table: Scenario | Input | Expected output. Every row is a decided case. Undecided cases are simply absent — not guessed. Business rules are derived from features (Phase 1): once you know what a feature does, you nail down exactly how the logic behaves.

**AI role:** Read before touching any logic. Flag when an implementation covers a case not in any table (potential spec gap). Never fill in the table autonomously.

**Tool:** `/sdlc-rules <spec-path>` — reads an approved feature spec, infers which scenarios need business-rules rows, proposes them as a draft table for human review, and writes only after explicit approval. Each proposed row is traced back to a specific AC item. Rows the human removes or rejects are simply absent — not guessed or filled in by the AI.

**Status:** ✅ Convention and files established. Decision-table spec files created in `specs/business-rules/` covering all implemented domains: `trips.md`, `expenses.md`, `person-detail.md`, `balance-display.md`, `settlement-recording.md` (new), plus the pre-existing `balance-calculation.md` and `settlement-calculation.md`. All 11 E2E feature specs now link to their referenced business-rules rows. Pre-commit hook (`.claude/hooks/doc-check.ps1`) warns when docs are not updated. Hard enforcement (spec coverage gate before commit) not yet built.

---

### 3. Design → code
**Goal:** Designer pushes UI comps; AI translates visual changes into React code.

**Approach:** Design comps live in `/design/` as `.dc.html` files synced from Claude Design (project ID in `.env` as `CLAUDE_DESIGN_PROJECT_ID`). This is an **ongoing parallel workflow** — not a one-time sequential gate. Whenever the designer pushes an update, run the sync for the affected screen(s).

**Tool:** `/sdlc-sync-app-design` — fetches a comp from Claude Design, diffs it visually against the local file, and applies only structural/style changes to the corresponding `src/pages/*.jsx` file. Never overwrites business logic, API calls, or routing.

**AI role:** Translate design intent into code. Never change behaviour — only structure and style.

**Status:** ✅ Done and validated. `/sdlc-sync-app-design` built and exercised end-to-end.

---

### 4. Implementation
**Goal:** AI writes only logic that is covered by a spec. No invented behaviour — for either features or business rules.

**Scope:** Implementation has two distinct inputs:
- **Feature specs** (Phase 1) → UI behaviour, API routes, component logic
- **Business rules** (Phase 2) → pure logic functions in `calc.js`

Both are spec-gated: before writing any logic, the exact spec row or AC item it satisfies must be cited. If a case has no coverage, the gap is surfaced to the human rather than guessed.

**Feature implementation — two-step human-gated pipeline:**

```
/sdlc-plan <spec-path>       → read spec + existing code → output implementation + test plan → human approves
/sdlc-implement <spec-path>  → execute approved plan: code changes + tests + verify
```

Idempotency check runs first — re-running on an already-implemented feature is safe.

**Business rules implementation — currently manual, no dedicated tool.** When a business-rules table is written or updated, the corresponding `calc.js` function is implemented by hand following the same cite-before-you-write discipline. A `/sdlc-implement-rules` skill (parallel to `/sdlc-implement` for features) is a natural future addition.

**AI role:** Implement exactly what specs say. Refuse to implement undecided cases. Surface gaps to the human.

**Status:** ✅ Done for feature implementation. Both skills built and live. Full feature workflow: `/sdlc-spec` (Phase 1) → `/sdlc-plan` → `/sdlc-implement` (Phase 4). Business rules implementation is manual.

---

### 5. Unit tests
**Goal:** Business logic verified at the function level — fast, no browser, no server required.

**Approach:** Each row in a business-rules table → one test case. `calc.js` holds pure business-logic functions with no DB I/O so they can be called directly with plain-array fixtures. A failing test always cites the spec row it came from.

**Tool:** Vitest. **Skill:** `/sdlc-generate-tests <spec-name>` — reads any `specs/business-rules/<spec-name>.md` file and generates the corresponding test file automatically, one `it()` per row, skipping known gaps.

**AI role:** Read a business-rules file, generate a test file with one `it()` per row.

**Status:** ✅ Done and validated. Three test files cover all spec-able business logic: `tests/balance-calculation.test.js`, `tests/settlement-calculation.test.js`, and `tests/person-detail.test.js` (generated after extracting `calculatePersonDetail` into `calc.js` as a pure function). 22 tests, all passing. Vitest configured to exclude Playwright generated files.

---

### 6. E2E tests
**Goal:** Browser-driven flows that verify the full stack — UI action → API → database → visible result.

**What E2E means:** A real browser opens, clicks buttons, fills forms, and asserts what appears on screen. It tests the entire chain from the user's perspective, which unit tests cannot catch (routing bugs, rendering failures, API wiring errors).

**Approach:** Each Given/When/Then in a feature file → one Playwright scenario. playwright-bdd wires `.feature` files under `specs/features/` to Playwright tests, keeping specs and tests in sync by design.

**Tool:** Playwright + playwright-bdd.

**AI role:** Generate `.feature` scenario stubs from feature spec AC. A failing E2E scenario always traces back to a specific feature file.

**Status:** ✅ Built and validated. 61 of 62 tests pass across all 11 feature files and all 4 domains (`@trips`, `@expenses`, `@balances`, `@settle-up`). The single failing test is `@wip` ("Zero balance card display" — a declared spec gap with no decided behaviour). Every feature-spec AC item is exercised end-to-end through a real browser → API → SQLite chain. Infrastructure: Playwright + playwright-bdd, `playwright.config.js`, `e2e/fixtures.js`, `e2e/global-setup.js`, 5 step-definition files, 11 `.feature` files, and `/sdlc-generate-e2e` skill.

---

### 7. Spec-aware code review
**Goal:** Code review that checks correctness *against specs*, not just code quality.

**Approach:** Extend the existing `/code-review` command with a spec-aware mode: given the changed files, find the relevant spec files, and verify the implementation matches every referenced spec row. Flag rows that are not covered by any test.

**AI role:** Cross-reference implementation against spec tables. Surface mismatches and coverage gaps.

**Status:** 🟡 `/code-review ultra` (built-in Claude Code command) exists. Spec-aware extension not yet built.

---

### 8. Documentation generation
**Goal:** Docs that are always in sync with specs and code — because they're generated from them.

**Three targets:**
- **API docs** — derived from `server.js` route definitions (mechanical)
- **User-facing docs** — derived from `/specs/features/` user stories
- **Changelog** — derived from git commits + spec file diffs (which spec row changed → what user-visible behaviour changed)

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
