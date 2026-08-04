# Contributing to Flexion

Flexion is open source under the MIT License, and outside contributions are welcome! Whether it's a new exercise, a bug fix, UI polish, documentation, or a research reference for the feedback layer — pull requests are genuinely appreciated.

## Core Team

- [@thearjunl](https://github.com/thearjunl)
- [@Saint006](https://github.com/Saint006) 
- [@deriiinjv](https://github.com/deriiinjv)
- [@Nevin-Siby](https://github.com/Nevin-Siby)

## How to Contribute

1. **Fork the repo** and clone your fork locally
2. **Check open issues** first — good starting points are tagged `good first issue` or `help wanted`. If you want to work on something not yet an issue (a new exercise, a feature), open an issue first to discuss before doing the work, so effort isn't wasted on something that doesn't fit the project direction
3. **Create a branch** off `main` (see naming convention below)
4. **Make your changes**, following the code style and testing expectations below
5. **Open a pull request** into `main` with a clear description of what changed and why
6. A core team member will review — expect feedback, especially on anything touching angle-calculation math or exercise config data (see note below)

## Workflow

### Branching

- `main` — always deployable, protected, only core team can merge into it
- Feature branches: `phase-N-short-description` (e.g. `phase-6-exercise-expansion`) or `fix/short-description` for bug fixes

### Commits

Keep commit messages scoped and descriptive:

```
feat: add lunge exercise config
fix: correct knee angle calculation for left-side landmarks
docs: update setup instructions for backend .env
```

### Pull Requests

1. Open a PR from your branch (or fork) into `main`
2. Include a short description of what changed and why
3. Link any related issue
4. At least one core team member reviews and approves before merging
5. For anything touching angle-calculation math, rep-state logic, or exercise config schemas — test manually against real camera footage before requesting review, not just `npm run build`. Note in the PR description how you tested it

### Code Style

- Frontend: TypeScript, typed props/returns, no `any` unless justified in a comment
- Backend: Python, type hints via Pydantic models, follow existing FastAPI route/service structure
- No unused imports, no commented-out dead code, no placeholder TODOs left in merged code — open an issue instead if something's incomplete

## Reporting Issues

Use GitHub Issues for bugs, exercise-accuracy problems, or feature ideas. For form-detection accuracy issues, please include:
- Which exercise
- What the app flagged vs. what actually happened
- Camera angle/lighting conditions if relevant (pose detection accuracy is angle/lighting-sensitive)

## A Note on Exercise Data

Joint-angle reference ranges (in `frontend/src/data/exercises/*.json`) are the most sensitive part of this codebase — incorrect thresholds could give users bad form guidance. Any change to these values should be backed by a cited source (biomechanics research, coaching literature) in the PR description, not just adjusted by feel.

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
