# PGLife Repository Cleanup Script
# Run from: C:\Users\ssang\Downloads\pglife\pglife
# Command:  .\cleanup.ps1

$root = Get-Location
Write-Host "`n PGLife Repo Cleanup" -ForegroundColor Cyan
Write-Host "Working in: $root`n" -ForegroundColor Gray

# ── Folders to delete ────────────────────────────────────────────────────────
$folders = @(
    "Claude Skills-20260315T064107Z-3-001",
    "fixed",
    "frontend-share",
    "new-ui",
    "ui_new"
)

foreach ($folder in $folders) {
    $path = Join-Path $root $folder
    if (Test-Path $path) {
        Remove-Item -Recurse -Force $path
        Write-Host "  Deleted folder: $folder" -ForegroundColor Red
    } else {
        Write-Host "  Skipped (not found): $folder" -ForegroundColor DarkGray
    }
}

# ── Files to delete ───────────────────────────────────────────────────────────
$files = @(
    "out.css",
    "DARK_REDESIGN_REPORT.md",
    "DYNAMIC_FIX_REPORT.md",
    "FEATURES_REPORT.md",
    "LEGAL_REPORT.md",
    "PRE_LAUNCH_AUDIT.md",
    "REDESIGN_REPORT.md",
    "SETUP_GUIDE.md",
    "TYPE_SAFETY_REPORT.md",
    "UI_UX_AUDIT_REPORT.md",
    "WARNINGS_FIX_REPORT.md"
)

foreach ($file in $files) {
    $path = Join-Path $root $file
    if (Test-Path $path) {
        Remove-Item -Force $path
        Write-Host "  Deleted file:   $file" -ForegroundColor Red
    } else {
        Write-Host "  Skipped (not found): $file" -ForegroundColor DarkGray
    }
}

# ── Update .gitignore ─────────────────────────────────────────────────────────
$gitignorePath = Join-Path $root ".gitignore"
$additions = @"

# Temp / exploration folders
fixed/
frontend-share/
new-ui/
ui_new/
ui fix/
Claude Skills*/

# Compiled CSS artifacts
out.css

# Report files
*_REPORT.md
SETUP_GUIDE.md
PRE_LAUNCH_AUDIT.md
"@

$current = Get-Content $gitignorePath -Raw -ErrorAction SilentlyContinue
if ($current -notlike "*Temp / exploration*") {
    Add-Content $gitignorePath $additions
    Write-Host "`n  Updated .gitignore with cleanup rules" -ForegroundColor Green
}

# ── Commit everything ─────────────────────────────────────────────────────────
Write-Host "`n  Committing cleanup..." -ForegroundColor Cyan
git add -A
git commit -m "chore: remove temp UI folders, old report files, update .gitignore"
git push origin main

Write-Host "`n Done! Repository is clean." -ForegroundColor Green
Write-Host " Removed: 5 folders + 11 files + updated .gitignore`n" -ForegroundColor Gray