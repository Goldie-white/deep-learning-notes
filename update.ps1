# Blog Update Script for Windows PowerShell
# Usage: .\update.ps1

Write-Host "Starting blog update..." -ForegroundColor Green

# Check if we're in a git repository
try {
    $null = git rev-parse --git-dir 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Not a git repository"
    }
} catch {
    Write-Host "ERROR: Not a git repository!" -ForegroundColor Red
    Write-Host "Please run 'git init' first, or navigate to a git repository."
    exit 1
}

# Check if there are any changes
$status = git status --porcelain
if (-not $status) {
    Write-Host "WARNING: No changes to commit." -ForegroundColor Yellow
    exit 0
}

# Show status
Write-Host "`nCurrent status:" -ForegroundColor Green
git status --short

# Ask for commit message
Write-Host "`nEnter commit message (or press Enter for default):" -ForegroundColor Green
$commitMessage = Read-Host

# Use default message if empty
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update blog content - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Host "Using default message: $commitMessage" -ForegroundColor Yellow
}

# Add all changes
Write-Host "`nAdding changes..." -ForegroundColor Green
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to add changes!" -ForegroundColor Red
    exit 1
}

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Green
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Commit failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Changes committed successfully!" -ForegroundColor Green

# Check if remote exists
$remotes = git remote
if ($remotes -notcontains "origin") {
    Write-Host "WARNING: No remote 'origin' found." -ForegroundColor Yellow
    Write-Host "Please add a remote repository first:"
    Write-Host "  git remote add origin <your-repo-url>"
    exit 1
}

# Get current branch name
$currentBranch = git branch --show-current
if (-not $currentBranch) {
    Write-Host "ERROR: Could not determine current branch!" -ForegroundColor Red
    exit 1
}

# Get remote URL to determine authentication method
$remoteUrl = git remote get-url origin
Write-Host "`nRemote URL: $remoteUrl" -ForegroundColor Cyan

# Push to remote
Write-Host "`nPushing to remote repository..." -ForegroundColor Green
if ($remoteUrl -like "https://*") {
    Write-Host "Using HTTPS authentication." -ForegroundColor Yellow
    Write-Host "If authentication is required, a browser window will open." -ForegroundColor Yellow
    Write-Host "Please complete the authentication in the browser.`n" -ForegroundColor Yellow
} else {
    Write-Host "Using SSH authentication." -ForegroundColor Yellow
    Write-Host "Make sure your SSH key is configured.`n" -ForegroundColor Yellow
}

# Push with timeout handling
$pushOutput = git push origin $currentBranch 2>&1
$pushExitCode = $LASTEXITCODE

if ($pushExitCode -eq 0) {
    Write-Host "`nSuccessfully pushed to origin/$currentBranch!" -ForegroundColor Green
    Write-Host "Blog update complete!" -ForegroundColor Green
} else {
    Write-Host "`nPush failed!" -ForegroundColor Red
    Write-Host "Exit code: $pushExitCode" -ForegroundColor Red
    Write-Host "`nOutput:" -ForegroundColor Yellow
    Write-Host $pushOutput
    
    Write-Host "`nPossible reasons:" -ForegroundColor Yellow
    Write-Host "  1. Authentication required - check if browser opened"
    Write-Host "  2. Network issues"
    Write-Host "  3. Remote repository doesn't exist or you don't have access"
    Write-Host "  4. Branch protection rules"
    Write-Host ""
    Write-Host "To manually push:" -ForegroundColor Cyan
    Write-Host "  git push origin $currentBranch"
    exit 1
}
