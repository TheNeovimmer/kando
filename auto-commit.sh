#!/bin/bash

# Workly Auto-Commit Script
# Commits and pushes changes to GitHub automatically

REPO_DIR="/home/neovimmer/Documents/workly"
REMOTE="origin"
BRANCH="master"
INTERVAL=60

echo "🚀 Workly auto-commit service started"
echo "   Watching for changes every ${INTERVAL} seconds..."

cd "$REPO_DIR" || exit 1

while true; do
    sleep "$INTERVAL"
    
    # Check if there are any changes
    if ! git diff --quiet --cached || ! git diff --quiet; then
        TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
        git add -A
        git commit -m "[auto] $TIMESTAMP" || true
        
        # Try to push, ignore if remote not configured yet
        if git remote get-url "$REMOTE" > /dev/null 2>&1; then
            git push "$REMOTE" "$BRANCH" 2>/dev/null && echo "✅ Pushed at $TIMESTAMP" || echo "⚠️  Push failed"
        else
            echo "⏳ Changes committed, no remote configured"
        fi
    fi
done
