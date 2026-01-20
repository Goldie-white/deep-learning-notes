#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting blog update...${NC}"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Not a git repository!${NC}"
    echo "Please run 'git init' first, or navigate to a git repository."
    exit 1
fi

# Check if there are any changes
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${YELLOW}WARNING: No changes to commit.${NC}"
    exit 0
fi

# Show status
echo -e "\n${GREEN}Current status:${NC}"
git status --short

# Ask for commit message
echo -e "\n${GREEN}Enter commit message (or press Enter for default):${NC}"
read -r commit_message

# Use default message if empty
if [ -z "$commit_message" ]; then
    commit_message="Update blog content - $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${YELLOW}Using default message: ${commit_message}${NC}"
fi

# Add all changes
echo -e "\n${GREEN}Adding changes...${NC}"
if ! git add .; then
    echo -e "${RED}ERROR: Failed to add changes!${NC}"
    exit 1
fi

# Commit changes
echo -e "${GREEN}Committing changes...${NC}"
if git commit -m "$commit_message"; then
    echo -e "${GREEN}Changes committed successfully!${NC}"
else
    echo -e "${RED}ERROR: Commit failed!${NC}"
    exit 1
fi

# Check if remote exists
if ! git remote | grep -q origin; then
    echo -e "${YELLOW}WARNING: No remote 'origin' found.${NC}"
    echo "Please add a remote repository first:"
    echo "  git remote add origin <your-repo-url>"
    exit 1
fi

# Get current branch name
current_branch=$(git branch --show-current)
if [ -z "$current_branch" ]; then
    echo -e "${RED}ERROR: Could not determine current branch!${NC}"
    exit 1
fi

# Get remote URL to determine authentication method
remote_url=$(git remote get-url origin)
echo -e "\n${CYAN}Remote URL: ${remote_url}${NC}"

# Push to remote
echo -e "\n${GREEN}Pushing to remote repository...${NC}"
if [[ "$remote_url" == https://* ]]; then
    echo -e "${YELLOW}Using HTTPS authentication.${NC}"
    echo -e "${YELLOW}If authentication is required, a browser window will open.${NC}"
    echo -e "${YELLOW}Please complete the authentication in the browser.${NC}\n"
else
    echo -e "${YELLOW}Using SSH authentication.${NC}"
    echo -e "${YELLOW}Make sure your SSH key is configured.${NC}\n"
fi

# Push with error handling
if git push origin "$current_branch"; then
    echo -e "\n${GREEN}Successfully pushed to origin/$current_branch!${NC}"
    echo -e "${GREEN}Blog update complete!${NC}"
else
    exit_code=$?
    echo -e "\n${RED}Push failed!${NC}"
    echo -e "${RED}Exit code: $exit_code${NC}"
    echo -e "\n${YELLOW}Possible reasons:${NC}"
    echo "  1. Authentication required - check if browser opened"
    echo "  2. Network issues"
    echo "  3. Remote repository doesn't exist or you don't have access"
    echo "  4. Branch protection rules"
    echo ""
    echo -e "${CYAN}To manually push:${NC}"
    echo "  git push origin $current_branch"
    exit 1
fi
