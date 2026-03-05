---
name: close
description: Safely close the current feature branch — delete locally, remotely, and remove Shopify preview theme
model: haiku
allowed-tools: Bash(*)

---

**IMPORTANT: This command must ONLY be executed when the user explicitly requests it (e.g., `/close`). NEVER invoke this command on your own initiative — always wait for the user's direct instruction.**

Safely close the current feature branch with full cleanup. Execute each step as a separate Bash call.

**Step 1 — Detect current branch**
Run: `git branch --show-current`
Save the output as BRANCH. Extract SHORT_NAME by stripping the `feature/` prefix from BRANCH.
If BRANCH is `production` — stop and report: "ERROR: You are on the production branch. Switch to a feature branch first."

**Step 2 — Check for uncommitted changes**
Run: `git status --porcelain`
If output is non-empty — stop and report: "ERROR: There are uncommitted changes. Commit or stash them first."

**Step 3 — Fetch latest remote state**
Run: `git fetch origin --prune`

**Step 4 — Read theme ID**
Read the file `.theme_ids/SHORT_NAME`. If it exists, save the contents as THEME_ID. If it doesn't exist, THEME_ID is empty.

**Step 5 — Switch to production and pull**
Run: `git checkout production`
Run: `git pull origin production`

**Step 6 — Delete Shopify preview theme (skip if THEME_ID is empty)**
Run: `shopify theme delete --store=qure-skincare --theme="THEME_ID" --force`
If successful, delete the file `.theme_ids/SHORT_NAME`.
If the command fails — print a warning but continue.

**Step 7 — Clean up screenshots and Playwright cache**
Run: `rm -rf .claude/screenshots/SHORT_NAME`
Run: `rm -rf .playwright-mcp/*`
If directories didn't exist — that's fine, continue.

**Step 8 — Delete local branch**
Run: `git branch -D BRANCH`

**Step 10 — Delete remote branch**
Run: `git branch -r | grep -q "origin/BRANCH$"`
If the remote branch exists — run: `git push origin --delete BRANCH`
If it doesn't exist — print: "Remote branch not found (already deleted or never pushed)."

**Done**
Print: "Branch BRANCH closed successfully."
