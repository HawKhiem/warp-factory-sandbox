# todo-api

A tiny in-memory todo HTTP API. It exists as a sandbox for evaluating
[Warp Factories](https://www.warp.dev/factories): the open issues in this repo
are seeded test tasks of varying difficulty, and the factory is asked to turn
them into pull requests.

## Endpoints

| Method | Path          | Description                 |
|--------|---------------|-----------------------------|
| GET    | `/todos`      | List todos (`page`, `size`, optional `done=true` or `done=false`) |
| POST   | `/todos`      | Create a todo (`{ title }`) |
| GET    | `/todos/:id`  | Get one todo                |
| PATCH  | `/todos/:id`  | Mark a todo done            |
| DELETE | `/todos/:id`  | Delete a todo               |

Status filtering applies before pagination; `total` counts matching todos.
Other `done` values return 400.

## Local development

- Use Node.js 20 or newer; no npm dependencies are needed.
- Run `npm start` to start the API on `PORT` (default: `3000`).
- Run `npm test` and `npm run lint` before opening a pull request.
- Use ES modules, two-space indentation, and single quotes.
- Branch from `main`, add or update tests, and open a pull request linking the
  issue it resolves. A maintainer reviews and merges; automated agents must not merge.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidance.

## Evaluation

- `factory/`: the Warp Factories definition used for the evaluation
- `eval/RUNBOOK.md`: how the evaluation is run
- `eval/scorecard.csv`: results per issue
