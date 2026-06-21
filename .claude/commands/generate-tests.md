Generate a Vitest test file from a business-rules spec. One `it()` per spec table row, each citing the row it covers.

**Usage:** `/generate-tests <spec-name>`
Example: `/generate-tests balance-calculation`

The spec name matches the filename in `specs/business-rules/` without the `.md` extension.

## Steps

1. Read `specs/business-rules/$ARGUMENTS.md`. If it doesn't exist, list the available files and stop.

2. Parse the spec table. Identify:
   - Each data row (scenario → input → expected output)
   - The **Known gaps** section — rows listed there must NOT get tests

3. Read `calc.js` to identify which pure function(s) the spec covers and their exact signatures.

4. Read the existing `tests/$ARGUMENTS.test.js` if it exists, to avoid overwriting tests for rows that are already covered.

5. For each spec table row (excluding known gaps):
   - Write one `it()` whose description is the scenario name followed by `[row N]`
   - Add a comment citing the spec row verbatim: `// spec row N: "Scenario | Input | Expected output"`
   - Build a plain-array fixture using the exact values from the Input column
   - Call the pure function from `calc.js` directly — never the DB wrappers in `db.js`
   - Assert the Expected output column value

6. Write the complete test file to `tests/$ARGUMENTS.test.js`.

7. Run `npm test` and report the results. If any test fails, diagnose and fix before reporting done.

## Rules

- Import from `../calc.js` using `createRequire`, not from `../db.js`
- No database, no server, no helper setup — fixtures are plain JS object literals
- Do not write tests for anything in the **Known gaps** section
- Do not invent scenarios not present in the spec table
- If the spec table references values that are ambiguous (e.g. "multiple creditors and debtors" without exact amounts), choose the simplest concrete numbers that satisfy the scenario and add a comment explaining the choice
- If a spec row tests a property that is already covered by another row's fixture (e.g. rows 7/8/9 in balance-calculation reuse the same setup as row 3), it is fine to write separate `it()` blocks with separate fixtures — do not share fixtures across tests
