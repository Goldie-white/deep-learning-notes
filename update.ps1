# Blog Update Script for Windows PowerShell
# Usage: .\update.ps1

Write-Host "🚀 Starting blog update..." -ForegroundColor Green

# Check if we're in a git repository
try {
    $null = git rev-parse --git-dir 2>$null
} catch {
    Write-Host "❌ Error: Not a git repository!" -ForegroundColor Red
    Write-Host "Please run 'git init' first, or navigate to a git repository."
    exit 1
}

# Check if there are any changes
$status = git status --porcelain
if (-not $status) {
    Write-Host "⚠️  No changes to commit." -ForegroundColor Yellow
    exit 0
}

# Show status
Write-Host "`n📋 Current status:" -ForegroundColor Green
git status --short

# Ask for commit message
Write-Host "`n💬 Enter commit message (or press Enter for default):" -ForegroundColor Green
$commitMessage = Read-Host

# Use default message if empty
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update blog content - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Host "Using default message: $commitMessage" -ForegroundColor Yellow
}

# Add all changes
Write-Host "`n📦 Adding changes..." -ForegroundColor Green
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Green
try {
    git commit -m $commitMessage
    Write-Host "✅ Changes committed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Commit failed!" -ForegroundColor Red
    exit 1
}

# Check if remote exists
$remotes = git remote
if ($remotes -notcontains "origin") {
    Write-Host "⚠️  No remote 'origin' found." -ForegroundColor Yellow
    Write-Host "Please add a remote repository first:"
    Write-Host "  git remote add origin <your-repo-url>"
    exit 1
}

# Get current branch name
$currentBranch = git branch --show-current

# Push to remote
Write-Host "`n🚀 Pushing to remote repository..." -ForegroundColor Green
Write-Host "If authentication is required, a browser window will open." -ForegroundColor Yellow
Write-Host "Please complete the authentication in the browser.`n" -ForegroundColor Yellow

try {
    git push origin $currentBranch
    Write-Host "`n✅ Successfully pushed to origin/$currentBranch!" -ForegroundColor Green
    Write-Host "🎉 Blog update complete!" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Push failed!" -ForegroundColor Red
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "  1. Authentication required - check if browser opened"
    Write-Host "  2. Network issues"
    Write-Host "  3. Remote repository doesn't exist or you don't have access"
    Write-Host ""
    Write-Host "To manually authenticate:"
    Write-Host "  - For HTTPS: git push origin $currentBranch"
    Write-Host "  - For SSH: Make sure your SSH key is added to GitHub/GitLab"
    exit 1
}

