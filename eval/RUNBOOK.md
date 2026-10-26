# Evaluation runbook

How to run the Warp Factories evaluation against this repo. Record every run
in `scorecard.csv`.

## 0. One-time setup
1. `bash eval/setup-github.sh` creates the private GitHub repo, labels and
   six seeded issues.
2. Sign in at https://platform.warp.dev with a Warp account and create a team
   if prompted. If Factories is gated for your account, request access at
   https://www.warp.dev/factories/request-access and stop here.
3. Click **+** next to Factories → connect GitHub → pick this repo → name the
   factory `sandbox` → keep the Code agent enabled.
4. Note how long steps 2–3 took (Warp claims about 5 minutes).

## 1. Smoke test (web chat)
New Chat → choose `sandbox` → send:
> Add a "Local development" section to README.md summarizing CONTRIBUTING.md.
> Only change README.md. Run npm run lint and npm test. Open a pull request.

Follow it under **Runs**; answer anything that lands in the **Inbox**.

## 2. Issue-driven runs
1. Mirror the definition in `factory/` in the web app's definition editor
   (or link the factory to GitHub; that needs the Build plan).
2. Add the `factory-ready` label to issues 2–6, one at a time. Wait for each
   PR before the next, so costs can be attributed per issue.
3. Review each PR yourself before merging.

## 3. Optional: harness comparison (Build plan)
Re-run issues 2–5 with the implementer on the Claude Code harness (see
warpdotdev/warp-factory-examples `03-multi-harness`) and compare cost,
time and correctness.

## What to capture per run
- Time from label to PR; cost from the run details or the dashboard
- CI result; whether tests were added; whether the diff stayed in scope
- What the reviewer agent flagged; how many times you had to step in
- Screenshots of the dashboard and inbox for the team review
