# Contributing

## Requirements

- Node.js 20 or newer. No npm dependencies are needed.

## Workflow

1. Create a branch from `main`.
2. Make your change and add or update tests under `test/`.
3. Run `npm test` and `npm run lint`; both must pass.
4. Open a pull request that links the issue it resolves (`Fixes #N`).
5. A maintainer reviews and merges. Automated agents must never merge.

## Running locally

```sh
npm start          # starts the API on PORT (default 3000)
npm test           # runs the node:test suite
```

## Style

- ES modules, two-space indentation, single quotes.
- Keep functions small and covered by tests.
