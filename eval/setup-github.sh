#!/usr/bin/env bash
# Creates the private GitHub repo, pushes main, and seeds the evaluation
# labels and issues. Run once from the repo root: bash eval/setup-github.sh
set -euo pipefail
REPO="${REPO:-HawKhiem/warp-factory-sandbox}"

gh repo create "$REPO" --private \
  --description "Sandbox todo API for evaluating Warp Factories" --source . --push

gh label create factory-ready      -R "$REPO" --color 0E8A16 --description "Ready for the factory to pick up"
gh label create "difficulty:easy"   -R "$REPO" --color C2E0C6 --description "Eval task - easy"
gh label create "difficulty:medium" -R "$REPO" --color FBCA04 --description "Eval task - medium"
gh label create "difficulty:hard"   -R "$REPO" --color D93F0B --description "Eval task - hard"

issue() { gh issue create -R "$REPO" --title "$1" --label "$2" --body "$3"; }

issue "Docs: add a Local development section to README" "difficulty:easy" \
"Add a **Local development** section to \`README.md\` that summarizes \`CONTRIBUTING.md\` (requirements, how to run, how to test). Only change \`README.md\`. \`npm run lint\` and \`npm test\` must pass."

issue "Bug: GET /todos?page=1 skips the first page" "difficulty:easy" \
"Pages are documented as 1-based, but \`GET /todos?page=1&size=10\` returns items 11-20 and the first ten todos are never returned. Fix it and add a regression test."

issue "Bug: slugify mangles accented characters and repeated spaces" "difficulty:medium" \
"\`slugify('Café  Crème')\` returns \`'caf--crme'\`. Expected \`'cafe-creme'\`: strip diacritics, collapse whitespace and hyphen runs, and trim leading and trailing hyphens. Add tests for these cases."

issue "Feature: filter todos by status" "difficulty:medium" \
"Support \`GET /todos?done=true|false\` to filter by completion status. The filter must apply before pagination so \`total\` reflects the filtered count. Reject other values of \`done\` with a 400. Update README endpoints table and add tests."

issue "CI is flaky: 'increasing timestamps' test fails intermittently" "difficulty:hard" \
"\`test/store.test.js\` › *todos created in sequence have increasing timestamps* fails roughly 1 run in 5 locally and in CI. Find the root cause and fix it properly. Retries or deleting the test don't count."

issue "Make the API faster" "difficulty:hard" \
"Users say the API feels slow. Please make it faster."

echo "Done: https://github.com/$REPO/issues"
