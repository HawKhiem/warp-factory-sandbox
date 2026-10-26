# Benchmark runbook

Step-by-step instructions for running the six-issue benchmark against a
software factory, and for checking its work. It was first used for Warp
Factories (results in the [README](../README.md)); the same steps work for any
provider that turns GitHub issues into pull requests.

## 1. Create a clean copy of the sandbox

Every provider gets its **own private repo** created from the `baseline` tag.
`main` in this repo contains the review, the answer key and the merged fixes,
so pointing a factory at it would leak the answers.

```sh
git fetch --tags
bash eval/new-provider-run.sh <provider>      # e.g. tessl, factory, vercel
```

This clones `baseline` into a temp folder, creates
`HawKhiem/factory-sandbox-<provider>` (set `OWNER=...` to use another account),
pushes it, and seeds the labels and six issues. Check that the six issues are
open before you start.

## 2. Connect the factory

Connect the provider to the new repo with **default settings**. Don't edit its
agent instructions: the point is to see how it behaves out of the box.
Note how long setup takes and whether it needs a prepaid balance or a plan.

If the provider bills from a balance, load a small amount and **turn off
auto-reload**. $20 of usage was enough for all six issues on Warp.

## 3. Send the issues

Send each issue on its own, in a **new chat or thread**, with exactly this
prompt and nothing else:

> Fix GitHub issue #N in this repo. Open a pull request that resolves it.

- Wait for each run to finish before starting the next, so costs can be
  attributed per issue. Write down the balance before and after each run.
- If the factory asks a question, record it before answering. For #6, answer:
  > There's no specific complaint behind this issue. Measure first. If nothing
  > is meaningfully slow, don't change any code: post your measurements as a
  > comment on issue #6 and recommend closing it.
- Merge each PR before sending the next issue, so later fixes start from the
  merged code. #3 and #2 touch the same file.

## 4. Check every PR yourself

Don't trust the factory's own "tests pass". For each PR, before merging it:

```sh
git fetch origin main pull/<PR>/head:pr-<PR>
git worktree add ../pr-<PR> pr-<PR>
cd ../pr-<PR>

node --test                                            # 1. new tests pass with the fix
git checkout "$(git merge-base HEAD origin/main)" -- src  # 2. put the old code back
node --test                                            # 3. new tests should now FAIL
git checkout HEAD -- src                               # restore

cd - && git worktree remove --force ../pr-<PR> && git branch -D pr-<PR>
```

Step 3 is the important one: tests that still pass on the old code don't catch
the bug. For #5 (the flaky test), also run the whole suite 40 times; it should
never fail:

```sh
for i in $(seq 1 40); do node --test >/dev/null 2>&1 || echo FAIL; done
```

Then compare the diff with [answer-key.md](answer-key.md): right root cause,
stayed in scope, no red flags.

## 5. Record the result

Add one row per issue to a copy of [scorecard.csv](scorecard.csv):

| Column | What to write |
|---|---|
| `harness`, `model` | Which coding agent and model ran it (provider default if not shown) |
| `minutes_to_pr` | Time from sending the prompt to the PR (or final answer) |
| `cost_usd` | Balance before minus balance after, or the provider's per-PR cost |
| `ci_green` | CI result on the PR (the flaky test fails ~1 in 5 runs until #5 is fixed) |
| `tests_added` | Did it add tests for the changed behaviour? |
| `scope_ok` | Did the diff stay within the issue? |
| `review_caught_issues` | What its own review step flagged, if it has one |
| `human_interventions` | How many times you had to step in |
| `correct_fix` | Your verdict after step 4 and the answer key |
| `notes` | Anything surprising, good or bad |

Take screenshots of anything worth showing the team: questions it asked,
hand-off messages, the cost dashboard.
