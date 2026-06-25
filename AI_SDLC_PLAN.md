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
| 1 | **Feature definition** | AI drafts, human approves | Human describes the feature in plain English. AI drafts a single combined artifact: user story + acceptance criteria + business rules table. Business rules must make *consequences* explicit (what data changes, what fails, what cascades) — not just CRUD-level AC items. |
| 2 | **Approve requirements** ⚑ | Human | **Load-bearing checkpoint.** Human approves or edits the combined draft. Approving means approving the *consequences*, not just the feature's existence. Nothing downstream proceeds without this approval. |
| 3 | **Design pull** *(UI features only)* | Human authors, AI pulls | Human authors or updates the design in Claude Design. AI fetches the comp, diffs it against current code, applies visual changes immediately. Behavioral changes (new buttons, modals, flows) are stubbed — logic is deferred until Step 5. If design introduces something with no approved spec, AI flags it and stops. |
| 4 | **Implementation plan** | AI drafts, human approves | AI reads the approved spec and any design diff. Returns a plan citing the specific spec row or AC item each planned change satisfies. Human approves or sends back for revision. |
| 5 | **Implement** | AI | Writes API routes, business logic, and UI wiring exactly as spec'd. Cites spec rows before writing each piece. Stops if a case arises with no spec coverage. |
| 6 | **Unit tests** | AI | Generates one `it()` per business-rules row in the spec file. Runs them. |
| 7 | **E2E tests** | AI | Generates one Gherkin scenario per AC item in the spec file. Runs them against the live app in a real browser. |
| 8 | **Code review** | AI | Runs `/sdlc-review <spec-path>`: invokes the built-in `/code-review` for correctness and quality, then adds a spec-fidelity pass — every code change must trace to a spec row, every spec row must have an implementation and a test. Untraceable behavior and unimplemented rows are blockers. |
| 9 | **Verify** ⚑ | Human | **Load-bearing checkpoint.** Human confirms: (a) all tests pass, (b) the running app matches what was approved in Step 2, and (c) any code-review blockers from Step 8 are resolved. Tests prove code matches itself — only a human can confirm code matches intent. |
| 10 | **Pipeline / CI** *(future)* | AI blocks, human approves merge | AI blocks merge if any spec row or AC item lacks a matching test. Generates release notes from what changed. |

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
| 1 | `/sdlc-feature` | ✅ | 🟡 | Merged replacement for the old `/sdlc-spec` + `/sdlc-rules` pair |
| 3 | `/sdlc-sync-app-design` | ✅ | ✅ | Spec-gate added: behavioral changes are stubbed pending spec approval |
| 4 | `/sdlc-plan` | ✅ | 🟡 | |
| 5 | `/sdlc-implement` | ✅ | 🟡 | Currently runs unit tests (Step 6); E2E generation (Step 7) done separately |
| 6 | `/sdlc-generate-tests` | ✅ | ✅ | Also called internally by `/sdlc-implement` |
| 7 | `/sdlc-generate-e2e` | ✅ | ✅ | |
| 8 | `/sdlc-review` | ✅ | ⬜ | Wraps `/code-review` + spec-fidelity pass (traceability, unimplemented rows, uncited tests) |
| 9 | — | ⬜ | ⬜ | Human checkpoint; no automation planned yet |
| 10 | — | ⬜ | ⬜ | Not started |

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

**What was built with the old two-skill approach:** `/sdlc-spec` (user story + AC) and `/sdlc-rules` (business rules table) were separate skills with separate approval gates. This created an unnecessary second gate and allowed the AI to proceed to plan/implement with a spec that had no business rules yet. The combined artifact closes that gap.

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

---

### Step 10 — Pipeline / CI *(not yet built)*

Planned gates:
- Every business-rules row must have a corresponding unit test.
- Every AC item must have a corresponding E2E scenario.
- Any spec row lacking a test blocks merge.
- Release notes are generated from spec file diffs between tags: which rows changed → what user-visible behavior changed.
