# todo-api

A tiny in-memory todo HTTP API. It exists as a sandbox for evaluating
[Warp Factories](https://www.warp.dev/factories): the open issues in this repo
are seeded test tasks of varying difficulty, and the factory is asked to turn
them into pull requests.

## Endpoints

| Method | Path          | Description                 |
|--------|---------------|-----------------------------|
| GET    | `/todos`      | List todos (`page`, `size`) |
| POST   | `/todos`      | Create a todo (`{ title }`) |
| GET    | `/todos/:id`  | Get one todo                |
| PATCH  | `/todos/:id`  | Mark a todo done            |
| DELETE | `/todos/:id`  | Delete a todo               |

## Evaluation

- `factory/`: the Warp Factories definition used for the evaluation
- `eval/RUNBOOK.md`: how the evaluation is run
- `eval/scorecard.csv`: results per issue
