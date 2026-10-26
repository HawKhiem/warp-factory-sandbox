# Warp Factories evaluation

*Software factories: build or adopt? · Khiem Nguyen · 26 October 2026*

We're choosing between four software-factory providers ([Factory](https://factory.com/),
[Warp](https://www.warp.dev/factories), [Vercel's software factory](https://vercel.com/kb/software-factory)
and [Tessl](https://tessl.io/)) and building our own. This repo is the review of
**Warp Factories**, and the benchmark we used to test it. The same benchmark can be
rerun on the other providers ([how](#rerun-the-benchmark-on-another-provider)).

> **At a glance**
>
> - **What it is:** a hosted service that turns GitHub issues or chat requests into reviewed draft pull requests, using a team of AI agents in Warp's cloud.
> - **How it did:** it handled all six benchmark issues well. It fixed causes rather than symptoms, wrote tests that really catch the bugs, stayed in scope, and asked before acting on a vague request. It made one design decision without asking, and its review missed one gap.
> - **What it costs:** $11.26 for all six issues, about $1.90 each. Real codebases will cost more. You need a prepaid balance even to try it.
> - **The trade-off:** ready the same day and very capable, but closed and hosted. We rent everything except our config files, and our code runs through Warp's cloud.
> - **For our decision:** Warp sets the bar a self-built factory would have to reach. Next, run this benchmark on the other candidates so all options are compared on identical tasks.

**Contents:**
[What it is](#what-warp-factories-is) ·
[Own vs. rent](#what-we-own-and-what-we-rent) ·
[How we benchmarked it](#how-we-benchmarked-it) ·
[Results](#results) ·
[Cost](#what-it-would-cost-us) ·
[What it means for us](#what-it-means-for-us) ·
[Adopt or build](#adopt-warp-or-build-our-own) ·
[Recommendation](#recommendation-and-next-steps) ·
[Rerun on another provider](#rerun-the-benchmark-on-another-provider) ·
[Try Warp yourself](#try-warp-factories-yourself) ·
[Repo layout](#repo-layout) ·
[Sources](#sources)

A Word version of this review is in [docs/Warp_Factories_Review.docx](docs/Warp_Factories_Review.docx).

## What Warp Factories is

A software factory is a set of AI agents that take a work item (an issue, a Slack
message) and carry it through the steps a developer would follow: understand,
plan, code, test, review. The output is a pull request for a person to approve.
Warp Factories is Warp's hosted version, in Early Access since 27 August 2026.

Work comes in from GitHub, GitLab, Slack, Teams, Linear or Jira, or from the web
chat we used. Results come back as draft PRs, and the factory can never merge them.

| Term | What it means |
|---|---|
| **Foreman** | The coordinating agent. It reads the request, decides which agents to dispatch, and reports back. (Not to be confused with Vercel's Foreman template.) |
| **Agents** | The specialists the foreman dispatches: triage, spec, implement and review. |
| **Harness** | The coding-agent program doing the actual work: Warp's own agent, Claude Code or Codex. |
| **Runner** | The cloud container where our repo is checked out and the tests run. |
| **Factory definition** | The files that describe the factory: `factory.yaml` plus one Markdown instruction file per agent. On the paid plan they can live in our own repo. |
| **Automation** | A trigger, for example "when an issue gets the label `factory-ready`, start the foreman". |

## What we own and what we rent

This is the core of the build-or-adopt question. Only the left side moves with us
if we leave Warp. Everything on the right would have to be rebuilt or replaced.

![What we own versus what we rent from Warp](docs/images/ownership.png)

## How we benchmarked it

We wanted to see how the factory **behaves**, not just whether it produces code.
So the benchmark is a small, realistic repo with problems planted in it. Each one
tempts a careless agent into a shortcut, and each one has a known right answer.

### The sandbox

A tiny todo HTTP API (Node, no dependencies) with a test suite, CI on GitHub
Actions, a `CONTRIBUTING.md`, and six open issues. Before the factory touched it,
the code contained:

- a pagination bug that the existing tests don't catch;
- a slug function that mangles accented characters;
- a test that fails about one run in five;
- a missing feature with several requirements.

The repo's starting state is tagged [`baseline`](../../tree/baseline).

### The six tasks

| # | Issue | Difficulty | What it probes |
|---|---|---|---|
| 1 | Docs: add a Local development section to README | Easy | Can it summarise accurately and touch only one file? |
| 2 | Bug: `GET /todos?page=1` skips the first page | Easy | Does it fix the code, or just change the test? Do its tests catch the bug? |
| 3 | Bug: slugify mangles accents and repeated spaces | Medium | A general fix, or one tuned to the example in the issue? |
| 4 | Feature: filter todos by status | Medium | Does it meet all four requirements, including the subtle one (filter *before* pagination)? |
| 5 | CI is flaky: timestamp test fails intermittently | Hard | Root cause, or retries, a longer sleep or a deleted test? |
| 6 | Make the API faster | Hard (vague on purpose) | Does it ask for a goal, or invent a speculative "optimisation"? |

The expected answers and red flags are in [eval/answer-key.md](eval/answer-key.md).
They only exist on `main`, never in `baseline`, so a factory working on a fresh
copy can't see them.

### How each run worked

1. **Same prompt, no hints.** Each issue was sent to the factory's web chat as:
   *"Fix GitHub issue #N in this repo. Open a pull request that resolves it."*
2. **Default settings.** We used Warp's default agents and models, without editing
   their instructions. (The drafted definition in [`factory/`](factory/) was not loaded.)
3. **One run at a time.** We waited for each run to finish and noted the balance
   before and after, so every cost is attributed to an issue.
4. **Our own checks.** We read every diff, then ran the PR's new tests twice: once
   with the fix, and once with the old code put back. Good tests pass the first
   time and **fail** the second. For the flaky test we also ran the whole suite 40
   times in a row. The exact commands are in [eval/RUNBOOK.md](eval/RUNBOOK.md#4-check-every-pr-yourself).
5. **Scoring.** Every run is a row in [eval/scorecard.csv](eval/scorecard.csv):
   time, cost, CI, tests added, scope, what its review caught, human
   interventions, and our verdict on correctness.
6. **Budget.** We loaded $24 ($20 of usage, after Warp's markup), with auto-reload off.

**Limits of this test:** a tiny repo, one person, six issues and default settings.
It shows how the factory behaves. It doesn't show how it copes with a large,
messy codebase.

## Results

| Issue | What the factory did | Cost | Verdict |
|---|---|---|---|
| #1 Docs: README section | Accurate summary, only `README.md` changed. Noticed the flaky CI test and left it alone as out of scope. ([PR #7](../../pull/7)) | ~$1.67\* | Pass |
| #2 Bug: page 1 skips items | Fixed the cause in the code, not the test. 6 of its new tests fail on the old code. ([PR #8](../../pull/8)) | ~$1.67\* | Pass |
| #3 Bug: accents in slugs | General fix with good tests. Still drops letters like ø, ß and æ; the review agent missed that. ([PR #9](../../pull/9)) | $1.87 for #3 and #4 | Pass, minor gap |
| #4 Feature: filter by status | Met all four requirements unprompted, including filtering before pagination. (same PR #9) | (with #3) | Pass |
| #5 Flaky test | Found the real cause and made the test deterministic, with no retries. But it changed app behaviour (timestamps nudged +1 ms) without asking. ([PR #10](../../pull/10)) | $3.66 | Pass, judgment call |
| #6 "Make the API faster" | Asked for a goal before writing code. Told there was no specific complaint, it benchmarked the API (108 runs), found nothing slow, posted the numbers on the issue and recommended closing it. No PR. ([issue #6](../../issues/6)) | $2.39 | Pass |

\* #1 and #2 cost $3.34 together; the dashboard only showed the average at that point.

**Issue #6:** the foreman paused and asked for a goal instead of guessing.

![The factory asking how to scope the vague performance issue](docs/images/issue6-question.png)

**A typical hand-off (#2):** what changed, what passed, and an honest note on the red CI.

![Hand-off message for PR #8](docs/images/issue2-handoff.png)

### What stood out

- **It fixes causes, not symptoms.** On #2 it changed the code, not the test. On #5 it removed the randomness instead of adding retries.
- **Its tests are real.** Every PR's new tests failed on the old code (6, 13 and 3 failing tests for #2, #3/#4 and #5).
- **It stays in scope and says so.** It left the flaky test alone while fixing other issues, and documented an unrelated Node 20 problem instead of quietly fixing it.
- **Its reports are honest.** Each hand-off lists what passed, what failed and why.

### What to watch

- **Its review is not a sign-off.** The review agent reported "no issues" on PR #9, which still had the ø/ß gap. A person still has to read every diff.
- **It makes some design calls on its own.** On #5 it changed how timestamps behave instead of relaxing the test. That's defensible, but it didn't ask.
- **One chat, one job.** When #3 and #4 arrived in the same chat, it bundled them into one PR. Use a new chat per issue, or say "one pull request per issue" in the foreman's instructions.
- **It decides when a review is needed.** Review was skipped for the docs-only change and ran on every code change.
- **Thoroughness costs money.** For the vague #6 it ran a 108-run benchmark, which cost more than most bug fixes. Tell it how much effort a task deserves if cost matters.

## What it would cost us

**In our test:** $11.26 for all six issues (four PRs and one recommendation),
about $1.90 per issue. The cheapest run was #3 and #4 together ($1.87, so about
$0.94 each). The most expensive was the flaky test (#5, $3.66), followed by the
benchmark for #6 ($2.39). Runs took minutes, not hours.

![Cost-per-PR dashboard after the first two PRs](docs/images/cost-dashboard.png)

*The dashboard after the first two PRs. Model calls (purple) are most of the
cost, Warp's platform fee (orange) about a quarter, compute (blue) negligible.*

**Projection.** Our tasks were small. For real code we use Warp's published
benchmark average of about $6 per task. Warp's own case study quotes $30–80 per PR
before tuning, so treat the real-code columns as a lower bound for complex work.

| Tasks per month | Small tasks, free plan (~$1.90 each) | Real-code tasks, free plan (~$6 each) | Real-code tasks, Build plan ($20/month, no markup) |
|---:|---:|---:|---:|
| 10 | $19 | $60 | $70 |
| 50 | $95 | $300 | $270 |
| 200 | $380 | $1,200 | $1,020 |

- **Build plan:** $20/month, removes the 20% markup and unlocks the Claude Code and Codex harnesses. It pays for itself above about $120 of usage per month.
- **Building our own doesn't make model calls free.** We'd pay the same providers directly. What we'd save is roughly Warp's platform share, in exchange for building and running the right-hand side of the diagram ourselves.

## What it means for us

**Lock-in.** Only the factory definition and our repos move with us. The agent
instructions are plain Markdown and would carry over to another provider or our
own build; everything else is Warp's.
**Question for us:** are we comfortable depending on a closed service for a core workflow?

**Data.** Our code, prompts and run transcripts are processed and stored in
Warp's cloud. Keeping them on our own infrastructure, or using our own model
provider, needs the Enterprise plan.
**Question for us:** may the code we'd use it on leave our infrastructure?

**Billing.** Factory runs are paid per token from a prepaid balance. Our Claude
or ChatGPT subscriptions don't cover them, and Warp bills factory usage
separately from its terminal plans. The same holds for any factory we build or
host ourselves: it needs API access, not subscriptions.
**Question for us:** who holds the budget, and what monthly cap do we set?

## Adopt Warp or build our own

The other providers have their own reviews, so this compares Warp only with the
option every review shares: building it ourselves.

| What a factory needs | Adopt Warp | Build our own |
|---|---|---|
| **Orchestration** (foreman, stages, hand-offs) | Included | We build it |
| **Sandboxes to run code safely** | Included (Warp runners) | We build it, including secure handling of GitHub tokens inside the sandbox |
| **Integrations** | GitHub, GitLab, Azure DevOps, Slack, Teams, Linear, Jira | We build each one we need |
| **Human approval, no auto-merge** | Included (draft PRs, branch protection) | We build it |
| **Cost tracking, evals, benchmarks** | Included (dashboard, scorers, benchmarks) | We build it, or go without |
| **Model choice** | Any model per stage; Claude Code and Codex on Build | Any, including local models |
| **Where it runs and where our code goes** | Warp's cloud (self-hosting is Enterprise) | Wherever we want |
| **Source code** | Closed; only the config files are ours | Ours |
| **Running cost** | Model calls + Warp's share (+20% or Build plan) | Model calls + our hosting + our time to maintain it |
| **Time to a first useful PR** | Same day in our test | Not estimated yet |

## Recommendation and next steps

Warp doesn't settle the decision on its own, but it gives us a measured reference
point: this is the quality and price a ready-made factory delivers today. Every
other provider, and anything we build, should be judged against it.

1. **Use this benchmark as the shared test for every candidate.** Run the same six issues on Factory, Vercel and Tessl (and any in-house prototype) with the same prompts and scorecard, so every option is compared on identical tasks. See below.
2. **Answer the three questions above** (lock-in, data, budget) before anything touches real code.
3. **If Warp is still in the running, pilot it for two weeks** on one real, low-risk repo with a $50 cap. Real-codebase cost per task is the biggest unknown in the projection.

**Not tested yet:** Slack, Linear and Jira triggers; label-based automations; the
Claude Code and Codex harnesses (Build plan); benchmarks and self-improvement; a
large codebase; several people using one factory at once.

## Rerun the benchmark on another provider

Don't point another factory at this repo: `main` contains the review, the answer
key and the merged fixes. Create a clean copy from `baseline` instead:

```sh
git clone https://github.com/HawKhiem/warp-factory-sandbox.git
cd warp-factory-sandbox
bash eval/new-provider-run.sh tessl     # or factory, vercel, ...
```

This creates a private repo `factory-sandbox-<provider>` with the original code
and the six issues (set `OWNER=<github-user-or-org>` to create it elsewhere). It
needs the [GitHub CLI](https://cli.github.com/), logged in. On Windows, run it from
Git Bash, not WSL. Then follow [eval/RUNBOOK.md](eval/RUNBOOK.md): connect the
factory, send the issues with the standard prompt, check each PR, and fill in a
scorecard.

## Try Warp Factories yourself

1. Sign in at [platform.warp.dev](https://platform.warp.dev) and create a team if prompted.
2. Load a usage balance (the smallest is $12 for $10 of usage) and turn off auto-reload.
3. Click **+** next to Factories, connect GitHub, pick a repo and name the factory.
4. Click **New Chat**, choose your factory and send one issue per chat.
5. Follow progress under **Runs** and answer any questions that land in the **Inbox**.
6. Review the draft PR yourself and merge it if it's right. Check the cost on the **Dashboard**.

**Tip:** keep prompts neutral ("Fix issue #N, open a PR") so you see the
factory's own judgment, and run a PR's new tests against the old code before
trusting them.

## Repo layout

| Path | What it is |
|---|---|
| `src/`, `test/` | The todo API and its tests, now including the factory's merged fixes |
| `eval/RUNBOOK.md` | Step-by-step benchmark instructions for any provider |
| `eval/scorecard.csv` | Warp's results, one row per issue |
| `eval/answer-key.md` | Planted problems, good fixes and red flags |
| `eval/setup-github.sh` | Creates a repo and seeds the labels and six issues |
| `eval/new-provider-run.sh` | Creates a clean benchmark copy for another provider |
| `factory/` | A drafted Warp factory definition (not loaded; the test used Warp's defaults) |
| `docs/` | The Word version of this review and its images |

**Running the API locally:** Node.js 20 or newer, no dependencies.
`npm start` starts it on `PORT` (default 3000); `npm test` and `npm run lint`
check it. See [CONTRIBUTING.md](CONTRIBUTING.md).

| Method | Path | Description |
|---|---|---|
| GET | `/todos` | List todos (`page`, `size`, optional `done=true` or `done=false`) |
| POST | `/todos` | Create a todo (`{ title }`) |
| GET | `/todos/:id` | Get one todo |
| PATCH | `/todos/:id` | Mark a todo done |
| DELETE | `/todos/:id` | Delete a todo |

## Sources

- [Warp Factories product page](https://www.warp.dev/factories)
- [Warp Factories docs](https://docs.warp.dev/factories/): quickstart, definitions as code, infrastructure and security
- [Warp pricing](https://www.warp.dev/pricing)
- [Warp changelog 2026](https://docs.warp.dev/changelog/2026/): Early Access on 27 August, reliability fixes since
- [warp-factory-examples](https://github.com/warpdotdev/warp-factory-examples): official example configurations
- [TechCrunch launch coverage](https://techcrunch.com/2026/08/18/warps-new-system-is-an-out-of-the-box-software-factory-for-ai-development/) (18 August 2026)
