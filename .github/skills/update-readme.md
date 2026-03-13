---
description: Update README after npm version bumps
applyTo: "**/package.json"
---

# Update README on Version Bump

When running `npm version` (patch, minor, or major), review all changes since the last published version and ensure `README.md` is up to date.

## Trigger

This skill applies whenever `package.json` version changes or when explicitly asked to prepare a release / bump version.

## Steps

1. **Identify the previous version tag** — run `git tag --sort=-v:refname | head -5` to find the last published tag (e.g. `v5.0.0`).

2. **Diff against the previous tag** — run `git diff <previous-tag>..HEAD --stat` to see which files changed, then inspect the relevant diffs:
    - `src/**` — any new or changed exports, renamed functions, removed modules
    - `package.json` — dependency changes, script changes
    - `tests/**` — new test coverage that hints at new features

3. **Read the current README** — read `README.md` fully to understand what is documented.

4. **Check for discrepancies** — compare the diff with the README and identify:
    - **New features** not yet documented
    - **Removed or renamed exports** still referenced in the README
    - **Changed APIs** (renamed functions, changed signatures, new options)
    - **Dependency changes** mentioned in docs (e.g. replaced library)
    - **Breaking changes** that need a migration note

5. **Update the README** — apply the minimum edits needed:
    - Add documentation for new public API surface
    - Remove or update docs for removed/changed APIs
    - If there are breaking changes, add them to the "Breaking Changes" section with migration examples
    - Keep the existing style, structure, and tone
    - Do **not** rewrite sections that haven't changed

6. **Verify** — re-read the updated README to confirm accuracy against the source code.

## Guidelines

- Only document **public exports** from `src/index.ts` and its re-exports.
- Match the existing documentation style (code examples with inline comments showing inferred types).
- Keep the Table of Contents in sync with section headings.
- If a new top-level module is added, add it to both the Table of Contents and as a new section.
- If a top-level module is removed, remove it from both places.
- Breaking changes should include before/after code snippets.
