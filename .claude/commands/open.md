---
name: open
description: Create a new feature branch from production and push as unpublished theme to Shopify
model: haiku
argument-hint: [branch-name]
allowed-tools: Bash(git *), Bash(shopify theme push *), Bash(mkdir -p *), Write
---

**IMPORTANT: This command must ONLY be executed when the user explicitly requests it (e.g., `/open branch-name`). NEVER invoke this command on your own initiative — always wait for the user's direct instruction.**

Create a new feature branch from the latest production and publish it as an unpublished theme to Shopify.
Branch name: `$ARGUMENTS`

Follow these steps in order, each as a separate tool call:

**Step 1 — Validate branch name**
Run: `git check-ref-format --branch "$ARGUMENTS"`
If exit code is non-zero — stop and report that the branch name is invalid.

**Step 2 — Check for uncommitted changes**
Run: `git status --porcelain`
If output is non-empty — stop and report error.

**Step 3 — Check branch doesn't exist locally**
Run: `git show-ref --verify --quiet "refs/heads/feature/$ARGUMENTS" && echo EXISTS || echo OK`
If output is EXISTS — stop and report error.

**Step 4 — Check branch doesn't exist remotely**
Run: `git ls-remote --exit-code --heads origin "feature/$ARGUMENTS" && echo EXISTS || echo OK`
If output is EXISTS — stop and report error.

**Step 5 — Switch to production and pull latest**
Run: `git checkout production && git pull origin production && git fetch --prune`

**Step 6 — Create feature branch**
Run: `git checkout -b "feature/$ARGUMENTS"`

**Step 7 — Push theme as unpublished to Shopify**
Run: `shopify theme push --unpublished --store qure-skincare --theme "feature/$ARGUMENTS"`
Extract theme ID from output line like: `The theme '...' (#NNNNNN) was pushed successfully.`

**Step 8 — Create directory and save theme ID**
Run: `mkdir -p .theme_ids`
Then use Write tool to save the theme ID (just the number) to `.theme_ids/$ARGUMENTS`

**Step 9 — Output result**
Print: `Theme ID <ID> saved to .theme_ids/$ARGUMENTS`
Print: `Preview: https://qureskincare.com/?_ab=0&_fd=0&_sc=1&preview_theme_id=<ID>`
