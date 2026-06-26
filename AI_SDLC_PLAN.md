# AI SDLC Plan — Driftlog

Driftlog is a testbed for **AI-augmented software development**. The app itself (a trip expense splitter) is the vehicle — the real experiment is mapping every phase of a standard SDLC to an AI workflow and proving each one out end-to-end.

## Core principle

```
Human intent
    ↓  (human writes OR approves AI draft)
Specs  (specs/features/<epic>/<feature>.md — user story + AC + business rules)
    ↓  (AI reads, never writes without human review)
Design comps → Code → Tests → Docs → Release notes
```

**Specs are the source of truth — not design, not code.** Design is always downstream of an approved spec. Even when a designer works ahead, behavioral changes are stubbed in code until a spec is written and approved. Passing tests prove the code matches *itself*; only a human can confirm the code matches *the approved intent*.

---

## Per-feature cycle

Every feature follows these steps in order.

| Step | Name | Who | What happens |
|---|---|---|---|
| 1 | **Feature definition** | AI drafts, human approves | Human describes the feature in plain English. AI creates a `feat/<slug>` branch, then drafts a single combined artifact: user story + acceptance criteria + business rules table. Business rules must make *consequences* explicit (what data changes, what fails, what cascades) — not just CRUD-level AC items. |
| 2 | **Approve requirements** ⚑ | Human | **Load-bearing checkpoint.** Human approves or edits the combined draft. Approving means approving the *consequences*, not just the feature's existence. Nothing downstream proceeds without this approval. |
| 3 | **Design pull** *(UI features only)* | Human authors, AI pulls | Human authors or updates the design in Claude Design. AI fetches the comp, diffs it against current code, applies visual changes immediately. Behavioral changes (new buttons, modals, flows) are stubbed — logic is deferred until Step 5. If design introduces something with no approved spec, AI flags it and stops. |
| 4 | **Implementation plan** | AI drafts, human approves | AI reads the approved spec and any design diff. Returns a plan citing the specific spec row or AC item each planned change satisfies. Human approves or sends back for revision. |
| 5 | **Implement** | AI | Writes API routes, business logic, and UI wiring exactly as spec'd. Cites spec rows before writing each piece. Stops if a case arises with no spec coverage. |
| 6 | **Unit tests** | AI | Generates one `it()` per business-rules row in the spec file. Runs them. |
| 7 | **E2E tests** | AI | Generates one Gherkin scenario per AC item in the spec file. Runs them against the live app in a real browser. |
| 8 | **Code review** | AI | Runs `/sdlc-review <spec-path>`: invokes the built-in `/code-review` for correctness and quality, then adds a spec-fidelity pass — every code change must trace to a spec row, every spec row must have an implementation and a test. Untraceable behavior and unimplemented rows are blockers. |
| 9 | **Verify** ⚑ | Human | **Load-bearing checkpoint.** Human confirms: (a) all tests pass, (b) the running app matches what was approved in Step 2, and (c) any code-review blockers from Step 8 are resolved. Tests prove code matches itself — only a human can confirm code matches intent. |
| 10a | **CI test gate** | AI (automated) | GitHub Action runs `npm test` + `npx playwright test` on every PR. Merge is blocked if any test fails. |
| 10b | **Spec-coverage enforcement** | AI (automated) | Script parses spec files, counts business-rules rows and AC items, compares against `[row N]` citations in unit tests and scenario titles in `.feature` files. Merge is blocked if any row or AC item has no corresponding test. |
| 10c | **Release notes** | AI (automated) | Action triggered on tag push diffs spec files between the previous and current tag, maps changed/added/removed rows to user-visible behavior, and writes a structured changelog (GitHub Release body and/or `CHANGELOG.md`). |

> ⚑ = human-owned checkpoint. Steps 2 and 9 cannot be automated — they require judgment that the artifact or behavior matches the *intent*, not just internal consistency.

---

## Open decisions

**Step 3 applicability.** A pure backend/logic-only feature has no design to pull and skips Step 3. Currently: AI proposes the skip and asks for human confirmation ("This appears to be a backend-only feature — no UI changes expected. Skip Step 3?"). Whether AI can determine this silently is undecided.

**Design-forward case.** When a designer adds something before a spec exists: `/sdlc-sync-app-design` stubs the visual element and reports the gap. The human must then run `/sdlc-feature` before logic can be added. This is the correct behavior — but it means the designer can get ahead of the spec. Whether to enforce spec-first in Claude Design itself (before the designer can add interactivity) is out of scope for this repo.

**Step 9 tooling.** "Verify" is currently a human-only step. A future `/sdlc-verify` skill could automate spec-coverage checking (every AC item and business-rules row has a corresponding test) and surface mismatches between spec language and implementation, reducing the human's verification burden to intent-only judgment.

---

## Tool inventory

Skills live in `.claude/skills/<name>/SKILL.md`. Built = tooling exists. Validated = exercised in a real workflow.

| Step | Skill | Built | Validated | Notes |
|---|---|---|---|---|
| 1 | `/sdlc-feature` | ✅ | ✅ | Merged replacement for the old `/sdlc-spec` + `/sdlc-rules` pair; now creates feature branch at start |
| 3 | `/sdlc-sync-app-design` | ✅ | ✅ | Spec-gate added: behavioral changes are stubbed pending spec approval |
| 4 | `/sdlc-plan` | ✅ | ✅ | |
| 5 | `/sdlc-implement` | ✅ | ✅ | Currently runs unit tests (Step 6); E2E generation (Step 7) done separately |
| 6 | `/sdlc-generate-tests` | ✅ | ✅ | Also called internally by `/sdlc-implement` |
| 7 | `/sdlc-generate-e2e` | ✅ | ✅ | |
| 8 | `/sdlc-review` | ✅ | ✅ | Wraps `/code-review` + spec-fidelity pass; GitHub Action also runs Claude review on every PR |
| 9 | — | ✅ | ✅ | Human checkpoint; no automation planned yet |
| 10a | — | ✅ | ✅ | GitHub Action on every PR: runs unit tests (Vitest) and E2E tests (Playwright BDD) as separate jobs; merge is blocked if either fails; test report uploaded as artifact |
| 10b | — | ✅ | ⬜ | `scripts/check-spec-coverage.js` runs as a third CI job on every PR; checks `[row N]` citations in unit tests and `[AC: ...]`-annotated scenario counts vs spec rows/AC items |
| 10c | — | ✅ | ✅ | GitHub Action on PR + push to master: diffs spec files, calls Claude to generate user-facing notes; posts changelog preview as PR comment (upserts on re-push), prepends dated entry to CHANGELOG.md on merge |

---

## Step details

### Step 1 — Feature definition

**Combined artifact format** (`specs/features/<epic>/<feature>.md`):

```
# Feature: [name]

## User story
As a [role], I want [capability], so that [outcome].

## Acceptance criteria
- Given [state], when [action], then [result]

## Business rules
| Scenario | Input | Expected output |
|---|---|---|
| ... | ... | ... |

## Out of scope

## Known gaps
```

The business rules table captures the *consequences* implied by the AC — data mutations, validation, error states, cascade effects, navigation side-effects. An AC item like "confirm deletion → trip removed" must produce rules for what "removed" means (which tables, what error if not found, etc.). CRUD-style AC without explicit consequences is incomplete at this step.

The spec file is the single source of truth for both code and tests. Unit tests cite rows from the business rules table; E2E tests cite AC items. If a row isn't in the table, it hasn't been decided.

---

### Step 3 — Design pull

**Normal flow (spec-first):** Human approves spec (Step 2) → designs or updates comps in Claude Design → runs `/sdlc-sync-app-design` → AI applies visual changes and stubs any behavioral additions → Step 4.

**Exception (design-first):** Designer adds something before a spec exists → sync detects a behavioral change → stubs the element visually → reports: "No spec found for this interaction. Run `/sdlc-feature '<description>'` before wiring the logic." Human writes the spec → returns to Step 3 or goes straight to Step 4.

**Change classification:** Every diff is classified as either visual-only (apply immediately) or behavioral (stub + flag). Visual = layout, color, spacing, static text. Behavioral = any new interactive element, modal, navigation, or state change.

---

### Steps 4–5 — Plan and implement

**Plan (`/sdlc-plan`):** Read-only. Every planned change cites the AC item or business-rules row it satisfies. If a case arises with no spec coverage, it is flagged as a gap — not inferred. Already-implemented pieces are reported and skipped.

**Implement (`/sdlc-implement`):** Idempotency check first. Each piece of logic is written only after citing the spec row it satisfies. If a case has no spec row, implementation stops and surfaces the gap.

---

### Steps 6–7 — Tests

**Unit tests** (`/sdlc-generate-tests`): One `it()` per business-rules row. Tests import directly from `calc.js` (pure functions, no DB). Each test description references the row: `[row N]`.

**E2E tests** (`/sdlc-generate-e2e`): One Gherkin scenario per AC item. Scenarios are tagged by domain (`@trips`, `@expenses`, etc.) and run against the full stack: browser → API → SQLite. Each scenario name references the AC item.

**Current test count:** 22 unit tests, 66 E2E tests (65 passing, 1 `@wip` for a declared spec gap).

---

### Step 8 — Code review

**Two-layer review** (`/sdlc-review <spec-path>`):

1. **Built-in `/code-review`** (high effort) — correctness bugs, dead code, simplification opportunities, security issues. Output reproduced in the combined report.

2. **Spec-fidelity pass** — the layer general code review cannot do:
   - *Code → spec:* every changed function, route, and UI element must trace to an AC item or business-rules row. Changes with no spec row are flagged as **invented behavior** and block shipping.
   - *Spec → code:* every AC item and business-rules row must have a corresponding implementation and a test. Missing rows are flagged as **incomplete implementation** and block shipping.
   - *Test citations:* unit test `it()` descriptions must include `[row N]`; E2E scenario titles must trace to an AC item. Uncited tests are flagged as weak coverage.

**Blockers vs. findings:** Only untraceable behavior and unimplemented spec rows are blockers. Style findings and simplification suggestions are non-blocking — they are surfaced but do not prevent moving to Step 9.

3. **Automated PR review (GitHub Action)** — `.github/workflows/ai-code-review.yml` runs on every pull request. Diffs the branch against base, sends it to Claude Sonnet 4.6, and posts findings as a PR comment grouped by blocker / warning / suggestion. Complements `/sdlc-review` but does not replace it — the Action has no access to spec files and cannot do the fidelity pass.

---

### Step 10 — Pipeline / CI *(not yet built)*

#### 10a — CI test gate

GitHub Action runs `npm test` (unit) and `npx playwright test` (E2E) on every PR. Merge is blocked if any test fails. This is the missing link that makes Steps 6–7 actually enforce anything — currently tests are run locally and manually.

#### 10b — Spec-coverage enforcement

A script (run as a CI step or standalone Action) parses spec files, counts business-rules rows and AC items, then compares them against `[row N]` citations in unit test `it()` descriptions and scenario titles in `.feature` files. Merge is blocked if any row or AC item has no corresponding test. This makes the spec-fidelity check that `/sdlc-review` currently does manually into a hard, automated gate.

#### 10c — Release notes

A skill or Action triggered on tag push diffs spec files between the previous and current tag. Changed, added, and removed rows are mapped to user-visible behavior and written as a structured changelog — GitHub Release body, `CHANGELOG.md` entry, or both.

---

## Maintenance track — Bug fixes

Bug fixes bypass the feature cycle. No spec, no design pull, no implementation plan — the issue is the source of truth.

| Step | Who | What happens |
|---|---|---|
| **1. File issue** | Human | GitHub issue describes the bug: steps to reproduce, expected vs. actual behavior. |
| **2. Fix** | AI | `/sdlc-fix-bug <issue-number>` creates a `fix/<issue-number>-<slug>` branch, reads the issue, locates the root cause, applies the fix, runs tests, verifies visually, commits, and opens a PR linked to the issue. Posts a comment on the issue with root cause + PR link. Labels the issue `fix-ready`. |
| **3. AI review** | AI (automated) | GitHub Action runs on the PR — diffs the fix, posts findings grouped by blocker / warning / suggestion. |
| **4. Validate** ⚑ | Human | Reviews the PR and the AI review comment. Merges if satisfied. Closing the PR auto-closes the linked issue. |

> ⚑ = human-owned checkpoint. AI labels `fix-ready` and opens the PR; only the human merges.

**Scope constraint:** If fixing the bug requires a behavioral change not currently in any spec (i.e. the bug is actually a missing or wrong spec row), `/sdlc-fix-bug` stops and surfaces the gap. The human must decide whether to update the spec first and run the feature cycle, or treat it as an emergency fix with a spec update to follow.

### Tool inventory

| Skill | Built | Validated | Notes |
|---|---|---|---|
| `/sdlc-fix-bug` | ✅ | ✅ | Creates `fix/<issue-number>-<slug>` branch, fixes, commits, opens PR linked to issue; human merges to auto-close |
