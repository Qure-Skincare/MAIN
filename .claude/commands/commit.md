---
name: commit
description: Commit changes and push theme to Shopify. Use automatically after completing any feature, fix, or refactoring.
model: haiku
allowed-tools: Bash(git *), Bash(cat *), Bash(grep *), Bash(shopify theme push *)
---

Commit all changes and push the updated theme to Shopify. Execute each step as a separate Bash call.

**Step 1 — Check working tree status**
Run: `git status --porcelain`
If output is empty — note "Nothing to commit", skip Steps 3–5, and proceed to Step 6 (Shopify Push always happens).

**Step 2 — Check current branch**
Run: `git branch --show-current`
If branch is `production` — stop and report: "You are on production. Use `npm run open --name=...` to create a feature branch first."
Save the output as BRANCH. Extract SHORT_NAME by stripping the `feature/` prefix from BRANCH.

**Step 3 — Review changes**
Run: `git diff HEAD`
Write a commit message: one line under 72 chars, imperative mood. If multiple changes — add bullet points after a blank line.

**Step 4 — Stage all changes**
Run: `git add .`

**Step 5 — Commit**
Run: `git commit -m "$(cat <<'EOF'`
`Your commit message here`
`EOF`
`)"`

**Step 6 — Read theme ID**
Run: `cat ".theme_ids/SHORT_NAME" 2>/dev/null`
- If file exists and contains a valid numeric ID → save as THEME_ID. Set HAS_THEME_ID=true.
- If file is missing or empty → set HAS_THEME_ID=false. The theme ID will be extracted from the Shopify push output in Step 8.

**Step 7 — Get changed theme files**
If nothing was committed in Step 1 — skip to Step 8 with full push (no `--only`).
Otherwise:
Run: `git diff --name-only HEAD~1 -- sections/ snippets/ templates/ assets/ config/ layout/ locales/ blocks/`
Then filter out context files:
Run: `grep -v '\.context\.' <<< "$DIFF_OUTPUT"`

- No theme files → skip push, tell user
- 1–20 files → use `--only` flag per file
- 20+ files → full push without `--only`

**Step 8 — Push to Shopify**
If HAS_THEME_ID=true — use `--theme="THEME_ID"` flag. Do NOT parse the push output for theme ID.
If HAS_THEME_ID=false — omit `--theme` flag, push as `--unpublished`. Parse the output to extract the new theme ID, then save it: `echo "THEME_ID" > ".theme_ids/SHORT_NAME"`.

For 1–20 files:
Run: `shopify theme push --store=qure-skincare --theme="THEME_ID" --nodelete --only file1 --only file2 ...`
For 20+ files:
Run: `shopify theme push --store=qure-skincare --theme="THEME_ID" --nodelete`

**Done — Summary**
Print:
```
✅ Committed: <commit message>
📦 Pushed to Shopify: <number of files> files → theme <THEME_ID>
🔗 Preview: https://qureskincare.com/?preview_theme_id=<THEME_ID>
```
If nothing was committed, replace the commit line with:
```
⏭️ Nothing to commit
```
If Shopify push was skipped (no theme files changed), replace the push line with:
```
⏭️ Shopify push skipped — no theme files changed
```

**Safety**
- NEVER use `--allow-live`. If Shopify warns the theme is live — stop immediately.
- If push fails — report the error, suggest retrying manually.
