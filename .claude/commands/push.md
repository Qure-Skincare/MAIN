---
name: push
description: Stage all changes, commit, and push to feature branch
model: haiku
argument-hint: [branch-name]
allowed-tools: Bash(git *)
---

Commit all current changes and push to the feature branch. Execute each step as a separate Bash call.

**Step 1 — Validate argument**
If `$ARGUMENTS` is empty — stop and report: "Branch name is required. Usage: /push <branch-name>"

**Step 2 — Check current branch**
Run: `git branch --show-current`
If branch is `production` — stop and report: "Cannot push from production branch. Switch to a feature branch first."
If branch is not `feature/$ARGUMENTS` — stop and report: "Current branch is <current>, but expected feature/$ARGUMENTS. Switch branch or fix the argument."

**Step 3 — Check working tree status**
Run: `git status --porcelain`
If output is empty — print "Nothing to commit." and go to step 6.

**Step 4 — Stage all changes**
Run: `git add .`

**Step 5 — Commit**
Run: `git commit -m "push ($ARGUMENTS)"`

**Step 6 — Push to remote**
Run: `git push -u origin feature/$ARGUMENTS`
