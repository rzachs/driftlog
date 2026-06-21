# PreToolUse hook: warns Claude if significant files are staged for commit
# but README.md, CLAUDE.md, or AI_SDLC_PLAN.md were not also staged.

$j = [Console]::In.ReadToEnd() | ConvertFrom-Json
$cmd = $j.tool_input.command

if ($cmd -notmatch 'git commit') { exit 0 }

$staged = (git diff --staged --name-only 2>$null) -split "`n" | Where-Object { $_ -ne "" }
if ($staged.Count -eq 0) { exit 0 }

$hasSignificant = $false
$hasReadme      = $false
$hasClaude      = $false
$hasSdlc        = $false

foreach ($f in $staged) {
    switch -Wildcard ($f) {
        "README.md"        { $hasReadme      = $true }
        "CLAUDE.md"        { $hasClaude      = $true }
        "AI_SDLC_PLAN.md"  { $hasSdlc        = $true }
        ".claude/skills/*" { $hasSignificant  = $true }
        "specs/*"          { $hasSignificant  = $true }
        "src/*"            { $hasSignificant  = $true }
        "server.js"        { $hasSignificant  = $true }
        "db.js"            { $hasSignificant  = $true }
        "calc.js"          { $hasSignificant  = $true }
    }
}

if ($hasSignificant -and (-not $hasReadme -or -not $hasClaude -or -not $hasSdlc)) {
    $missing = @()
    if (-not $hasReadme) { $missing += "README.md" }
    if (-not $hasClaude) { $missing += "CLAUDE.md" }
    if (-not $hasSdlc)   { $missing += "AI_SDLC_PLAN.md" }
    $missingList = $missing -join ", "

    @{
        hookSpecificOutput = @{
            hookEventName     = "PreToolUse"
            additionalContext = "DOC-CHECK: Significant files are staged for commit but these doc files are NOT staged: $missingList -- Before proceeding, check whether README.md, CLAUDE.md, and AI_SDLC_PLAN.md need updating to reflect this change."
        }
    } | ConvertTo-Json -Compress -Depth 5
}
