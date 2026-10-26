#!/usr/bin/env bash
# Creates a clean copy of the benchmark for another provider: a new private
# repo at the `baseline` tag (no review, no answer key, no fixes), with the
# labels and six issues seeded.
# Usage, from the repo root: bash eval/new-provider-run.sh <provider>
set -euo pipefail
PROVIDER="${1:?usage: bash eval/new-provider-run.sh <provider>}"
OWNER="${OWNER:-HawKhiem}"
SRC="$(git rev-parse --show-toplevel)"
DIR="$(mktemp -d)/factory-sandbox-$PROVIDER"

git -C "$SRC" rev-parse -q --verify refs/tags/baseline >/dev/null \
  || { echo "Tag 'baseline' not found; run: git fetch --tags" >&2; exit 1; }

git clone -q --branch baseline "$SRC" "$DIR"
cd "$DIR"
git switch -q -c main
git remote remove origin

REPO="$OWNER/factory-sandbox-$PROVIDER" bash eval/setup-github.sh
echo "Local copy: $DIR"
