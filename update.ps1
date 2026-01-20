# Blog Update Script for Windows PowerShell
# Usage: .\update.ps1
# Automatically scans folders for new articles, updates script.js, then commits and pushes

Write-Host "Starting blog update..." -ForegroundColor Green

# ============================================================================
# Step 1: Scan folders and sync new articles to script.js
# ============================================================================

Write-Host "`nStep 1: Scanning folders for new articles..." -ForegroundColor Cyan

# Define folder mappings and their data structures
$folders = @{
    "Model Architecture Analysis" = @{
        ArrayName = "architectureNotes"
        Type = "article"
    }
    "Paper Reading" = @{
        ArrayName = "papers"
        Type = "paper"
    }
    "Research Log" = @{
        ArrayName = "notebookEntries"
        Type = "notebook"
    }
}

# Read current script.js
$scriptPath = "script.js"
if (-not (Test-Path $scriptPath)) {
    Write-Host "ERROR: script.js not found!" -ForegroundColor Red
    exit 1
}

$scriptContent = Get-Content $scriptPath -Raw -Encoding UTF8

# Function to extract existing file paths from script.js
function Get-ExistingFiles($arrayName) {
    # Use multiline regex to match array content across multiple lines
    $pattern = "(?s)$arrayName\s*=\s*\[(.*?)\];"
    if ($scriptContent -match $pattern) {
        $arrayContent = $matches[1]
        $filePattern = 'contentFile:\s*"([^"]+)"'
        $files = [regex]::Matches($arrayContent, $filePattern) | ForEach-Object { $_.Groups[1].Value }
        return $files
    }
    return @()
}

# Function to get next available ID
function Get-NextId($arrayName) {
    # Use multiline regex to match array content across multiple lines
    $pattern = "(?s)$arrayName\s*=\s*\[(.*?)\];"
    if ($scriptContent -match $pattern) {
        $arrayContent = $matches[1]
        $idPattern = 'id:\s*(\d+)'
        $ids = [regex]::Matches($arrayContent, $idPattern) | ForEach-Object { [int]$_.Groups[1].Value }
        if ($ids.Count -gt 0) {
            return ($ids | Measure-Object -Maximum).Maximum + 1
        }
    }
    return 1
}

# Scan folders and find new files
$newArticles = @()

foreach ($folder in $folders.Keys) {
    $folderPath = $folder
    $folderConfig = $folders[$folder]
    $arrayName = $folderConfig.ArrayName
    $type = $folderConfig.Type
    
    if (-not (Test-Path $folderPath)) {
        Write-Host "WARNING: Folder '$folderPath' not found, skipping..." -ForegroundColor Yellow
        continue
    }
    
    Write-Host "`nScanning folder: $folderPath" -ForegroundColor Cyan
    
    # Get all .md files in folder
    $mdFiles = Get-ChildItem -Path $folderPath -Filter "*.md" -File
    
    if ($mdFiles.Count -eq 0) {
        Write-Host "  No .md files found." -ForegroundColor Gray
        continue
    }
    
    # Get existing files
    $existingFiles = Get-ExistingFiles $arrayName
    
    foreach ($file in $mdFiles) {
        $relativePath = "$folderPath/$($file.Name)"
        $normalizedPath = $relativePath.Replace('\', '/')
        
        # Check if file already exists in config
        # Match by exact path or by filename (handle different path formats)
        $exists = $false
        foreach ($existing in $existingFiles) {
            $existingNormalized = $existing.Replace('\', '/').Trim()
            $normalizedPathTrimmed = $normalizedPath.Trim()
            # Match by exact path (case-insensitive), or by filename at the end of path
            # Also check if the filename appears anywhere in the path
            if ($existingNormalized -eq $normalizedPathTrimmed -or 
                $existingNormalized.ToLower() -eq $normalizedPathTrimmed.ToLower() -or
                $existingNormalized -eq $normalizedPathTrimmed.Replace('/', '\') -or
                $existingNormalized.EndsWith("/$($file.Name)", [System.StringComparison]::OrdinalIgnoreCase) -or
                $existingNormalized.EndsWith("\$($file.Name)", [System.StringComparison]::OrdinalIgnoreCase) -or
                $existingNormalized -eq $file.Name -or
                $existingNormalized.Contains($file.Name)) {
                $exists = $true
                break
            }
        }
        
        if ($exists) {
            Write-Host "  ✓ $($file.Name) - already configured" -ForegroundColor Gray
        } else {
            Write-Host "  ✗ $($file.Name) - NEW FILE FOUND!" -ForegroundColor Yellow
            
            # Read first few lines to get potential summary
            $content = Get-Content $file.FullName -TotalCount 10 -Encoding UTF8
            $firstLine = if ($content.Count -gt 0) { $content[0] -replace '^#+\s*', '' } else { "" }
            
            # Get next ID
            $nextId = Get-NextId $arrayName
            
            # Get file dates
            $createdDate = $file.CreationTime.ToString("yyyy-MM-dd")
            $modifiedDate = $file.LastWriteTime.ToString("yyyy-MM-dd")
            
            # Different fields based on type
            if ($type -eq "article") {
                # Architecture Notes: tags, summary, contentFile, createdDate, modifiedDate
                Write-Host "`n  Configuring new article: $($file.Name)" -ForegroundColor Cyan
                $tagsInput = Read-Host "  Enter tags (comma-separated, e.g. 'Tag1,Tag2')"
                $summaryInput = Read-Host "  Enter summary (or press Enter to use first line: '$firstLine')"
                
                if ([string]::IsNullOrWhiteSpace($summaryInput)) {
                    $summaryInput = $firstLine
                }
                
                $tags = $tagsInput -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
                $tagsJson = ($tags | ForEach-Object { "`"$_`"" }) -join ', '
                
                $newArticle = @{
                    Id = $nextId
                    ArrayName = $arrayName
                    Type = $type
                    ContentFile = $normalizedPath
                    Tags = $tagsJson
                    Summary = $summaryInput
                    CreatedDate = $createdDate
                    ModifiedDate = $modifiedDate
                }
            } elseif ($type -eq "paper") {
                # Papers: title, authors, year, takeaway
                Write-Host "`n  Configuring new paper: $($file.Name)" -ForegroundColor Cyan
                $titleInput = Read-Host "  Enter paper title (or press Enter to use filename)"
                if ([string]::IsNullOrWhiteSpace($titleInput)) {
                    $titleInput = $file.BaseName
                }
                $authorsInput = Read-Host "  Enter authors (e.g. 'He et al.')"
                $yearInput = Read-Host "  Enter year"
                $takeawayInput = Read-Host "  Enter your takeaway"
                
                $newArticle = @{
                    Id = $nextId
                    ArrayName = $arrayName
                    Type = $type
                    Title = $titleInput
                    Authors = $authorsInput
                    Year = $yearInput
                    Takeaway = $takeawayInput
                }
            } elseif ($type -eq "notebook") {
                # Notebook: date, title, snippet
                Write-Host "`n  Configuring new notebook entry: $($file.Name)" -ForegroundColor Cyan
                $titleInput = Read-Host "  Enter title (or press Enter to use filename)"
                if ([string]::IsNullOrWhiteSpace($titleInput)) {
                    $titleInput = $file.BaseName
                }
                $snippetInput = Read-Host "  Enter snippet (or press Enter to use first line)"
                if ([string]::IsNullOrWhiteSpace($snippetInput)) {
                    $snippetInput = $firstLine
                }
                
                $newArticle = @{
                    Id = $nextId
                    ArrayName = $arrayName
                    Type = $type
                    Date = $createdDate
                    Title = $titleInput
                    Snippet = $snippetInput
                }
            }
            
            $newArticles += $newArticle
        }
    }
}

# Update script.js with new articles if any
if ($newArticles.Count -gt 0) {
    Write-Host "`nUpdating script.js with $($newArticles.Count) new article(s)..." -ForegroundColor Green
    
    foreach ($article in $newArticles) {
        $arrayName = $article.ArrayName
        $type = $article.Type
        $pattern = "($arrayName\s*=\s*\[)(.*?)(\];)"
        
        if ($scriptContent -match $pattern) {
            $before = $matches[1]
            $arrayContent = $matches[2]
            $after = $matches[3]
            
            # Create new entry based on type
            if ($type -eq "article") {
                $newEntry = @"
    {
        id: $($article.Id),
        tags: [$($article.Tags)],
        summary: "$($article.Summary -replace '"', '\"')",
        contentFile: "$($article.ContentFile)",
        createdDate: "$($article.CreatedDate)",
        modifiedDate: "$($article.ModifiedDate)"
    }
"@
            } elseif ($type -eq "paper") {
                $newEntry = @"
    {
        id: $($article.Id),
        title: "$($article.Title -replace '"', '\"')",
        authors: "$($article.Authors -replace '"', '\"')",
        year: $($article.Year),
        takeaway: "$($article.Takeaway -replace '"', '\"')"
    }
"@
            } elseif ($type -eq "notebook") {
                $newEntry = @"
    {
        id: $($article.Id),
        date: "$($article.Date)",
        title: "$($article.Title -replace '"', '\"')",
        snippet: "$($article.Snippet -replace '"', '\"')"
    }
"@
            }
            
            # Add comma if array is not empty
            if ($arrayContent.Trim() -ne '') {
                $newEntry = ",`n" + $newEntry
            }
            
            # Insert new entry before closing bracket
            $newArrayContent = $arrayContent + $newEntry
            $scriptContent = $scriptContent -replace [regex]::Escape($before + $arrayContent + $after), ($before + $newArrayContent + $after)
            
            $displayName = if ($article.ContentFile) { $article.ContentFile } else { $article.Title }
            Write-Host "  ✓ Added: $displayName" -ForegroundColor Green
        } else {
            Write-Host "  ✗ ERROR: Could not find $arrayName array in script.js" -ForegroundColor Red
        }
    }
    
    # Write updated script.js
    $scriptContent | Set-Content $scriptPath -Encoding UTF8 -NoNewline
    Write-Host "`nscript.js updated successfully!" -ForegroundColor Green
} else {
    Write-Host "`nNo new articles found. All files are already configured." -ForegroundColor Green
}

# ============================================================================
# Step 2: Git commit and push
# ============================================================================

Write-Host "`nStep 2: Committing and pushing changes..." -ForegroundColor Cyan

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
