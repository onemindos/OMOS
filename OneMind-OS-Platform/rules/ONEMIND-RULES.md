# OneMind OS — Fork Constitution

**This file is the law. Read it before every commit.**

## 1. Where We Live (the sandbox)

We are allowed to **create** files in these locations. They are "ours."
Upstream never touches these paths, so merges stay clean forever:

| Path | Purpose |
|------|---------|
| `api/web/plugins/onemind-ai/` | Legacy AI plugin (already built) |
| `api/web/src/omos/` | All our new pages & components |
| `api/lib/nats-bridge.ts` | NATS connection layer |
| `.github/workflows/build-omos.yml` | Our build pipeline |
| `.github/workflows/upstream-sync.yml` | This automation |
| `docs/onemind/` | Our docs |
| `ONEMIND.md` | This file |

## 2. Rules

### + Adding code
GREEN. Just make sure it lives in a sandbox location. Commit freely.

### ~ Modifying upstream files
RED — requires thought. Every modification is a future merge conflict.

Allowed only for:
- **Router/nav registration** — adding routes in `api/web/src/router.ts` or nav entries in main layout. Keep to 2-3 lines, put them at the BOTTOM of the array.
  ```vue
  <!-- ✅ SAFE: append at bottom of routes -->
  { path: '/fabric', component: () => import('../omos/Fabric.vue') }
  ```
- **Bug fixes with cherry-pick upstream** — same change upstream makes, we get it back next sync for free.

### - Removing upstream code
FORBIDDEN unless:
- You documented why in ONEMIND.md
- You checked for hidden dependencies (`grep -r "that-component"` )
- It's AWS-specific garbage we own (e.g. `api/lib/aws/*`)
- You accept full responsibility for the future merge conflicts

## 3. The Upstream Sync Contract

### The automated workflows do this every Monday:
```
1. Fetch latest upstream tag (e.g. v13.57.4)
2. Pre-flight check: verify all our commits are in sandbox paths
   → If NOT: refuses to merge, creates issue with the offending files
3. Merge tag into main
   → Conflicts? Aborts the merge, creates issue, assigns Zeus
   → Clean? Pushes to main immediately
4. build-omos.yml auto-fires → GHCR builds
5. ArgoCD deploys new image within ~2 minutes
```

**So is this safe?** Yes, because of Rule 1 & 2. The sync workflow will NOT push a broken merge. It either goes through clean (99% chance) or stops and tells you exactly where.

### Security releases (CVEs)
The workflow runs the same merge regardless of schedule. When triggered mid-week with `force_mode: 'security'`, it skips the "only Monday" logic.

### If the sync fails
Check the GitHub issue it created. The conflicted files will be listed. Resolution pattern:
```bash
git merge --abort                    # if you're in a conflicted state
git checkout upstream/main -- <file> # take their version of conflicted file
# re-apply OUR change to it manually (keep ours in a comment block)
git add <file> && git commit
```

## 4. Verification Before Every Commit

Before pushing anything that touches upstream files:

```bash
./scripts/fork-guard.sh
```

This runs the same pre-flight check the automation uses. If it exits non-zero, you're violating the constitution.

## 5. What To Do If a Merge Conflict Happens (runbook)

```
Monday 09:03 UTC — you get a GitHub notification
"Issue: Upstream conflicts in v13.57.5"

Steps:
1. Clone the repo
2. git fetch upstream --tags && git merge v13.57.5
3. git status   (shows conflicted files)
4. For each conflict:
   - If conflict is in OUR sandbox files (omos/ or plugins/):
       We keep ours. `git checkout --ours <file>`
   - If conflict is in an upstream file we HAD to touch:
       Take upstream's version first (`git checkout --theirs <file>`)
       Then re-apply our edit manually from a stash/comment
   - If the upstream file was DELETED:
       That dir got moved/renamed. Merge manually per-file.
5. npm run lint && npm run check   (ensure nothing broke)
6. Test build: docker build --target build ./api
7. git add . && git commit && git push
```

## 6. The Golden Numbers

- **Weekly auto-merges:** ~52 times/year, mostly clean
- **Expected manual fixes:** 1-4 times/year (upstream restructures we clash with)
- **Current upstream cadence:** ~0.9 releases/day
- **Our lag tolerance:** Up to 7 days max. Never fall further behind — the backlog of 20+ version diffs becomes dangerous.

---
**Signed:** Mother (Legacy) & Zeus, Day One of the Fork
