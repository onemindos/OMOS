#!/usr/bin/env bash
# fork-guard.sh — Pre-flight check before any commit that touches upstream files
# Exits 0 if clean (all changes in sandbox), exits 1 if protected files modified.
#
# Usage: ./scripts/fork-guard.sh
# Or:    ./scripts/fork-guard.sh <base-ref>  (default: origin/main)

set -euo pipefail

BASE_REF="${1:-origin/main}"
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Sandbox paths — files here are "ours" and safe to modify
SANDBOX_PATTERNS=(
    '\.github/workflows/build-omos\.yml'
    '\.github/workflows/upstream-sync\.yml'
    'api/web/plugins/'
    'api/web/src/omos/'
    'api/lib/omos/'
    'docs/onemind/'
    'ONEMIND\.md'
    '\.github/CODEOWNERS'
    'scripts/fork-guard\.sh'
)

echo "🔍 Running fork-guard pre-flight check..."
echo "   Base ref: $BASE_REF"
echo ""

# Get files changed relative to base
if ! CHANGED_FILES=$(git diff --name-only "$BASE_REF" HEAD 2>/dev/null); then
    echo -e "${YELLOW}⚠ Could not diff against $BASE_REF (maybe first commit). Skipping.${NC}"
    exit 0
fi

if [ -z "$CHANGED_FILES" ]; then
    echo -e "${GREEN}✅ No changes to check.${NC}"
    exit 0
fi

# Build grep pattern for sandbox
SANDBOX_REGEX=$(IFS='|'; echo "${SANDBOX_PATTERNS[*]}")

VIOLATIONS=""
CLEAN=""
while IFS= read -r file; do
    if echo "$file" | grep -qE "$SANDBOX_REGEX"; then
        CLEAN="${CLEAN}  ✅ $file\n"
    else
        VIOLATIONS="${VIOLATIONS}  ❌ $file\n"
    fi
done <<< "$CHANGED_FILES"

if [ -n "$CLEAN" ]; then
    echo -e "${GREEN}Sandbox files (safe):${NC}"
    echo -e "$CLEAN"
fi

if [ -n "$VIOLATIONS" ]; then
    echo -e "${RED}❌ PROTECTED UPSTREAM FILES MODIFIED:${NC}"
    echo -e "$VIOLATIONS"
    echo ""
    echo -e "${RED}These files belong to upstream CloudTAK and will cause merge conflicts.${NC}"
    echo -e "${RED}If this is intentional (router hook, bug fix), document why in ONEMIND.md.${NC}"
    echo -e "${RED}Otherwise, revert these changes and implement in a sandbox file.${NC}"
    echo ""
    echo "See: ONEMIND.md § 2 Rules — Modifying upstream files"
    exit 1
fi

echo -e "${GREEN}✅ All changes are inside the OneMind sandbox. Safe to commit.${NC}"
exit 0
