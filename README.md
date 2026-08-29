# lifeOS

Collection of apps I use daily that suits my personal needs. A monorepo holding
both TypeScript and Python projects.

## Layout

```
apps/site/     developer blog. Next.js 15, MDX, Contentlayer. Deployed on Vercel.
packages/      shared code. Empty until something is genuinely shared twice.
```

## Getting started

```sh
mise install            # node, pnpm, python, uv, at the versions in mise.toml
pnpm install
pnpm dev                # every app's dev server
```

Turborepo runs the tasks; mise pins the toolchain. Neither replaces the other:
mise has no task-output cache and no `--affected`, which is most of why Turbo
is here.

## Common commands

```sh
pnpm build                       # everything
pnpm turbo run build --filter=site
pnpm turbo run lint typecheck test --affected
```

`--affected` diffs against `main`, so it only runs tasks for packages your
branch actually touched. CI uses the same command.

## Adding a Python project

Turborepo discovers packages through `package.json`, and has no idea what
Python is. The workaround is two manifests in the same directory: a
`pyproject.toml` that uv reads, and a small `package.json` whose scripts hand
the real work to uv. Turbo then treats it like any other package, caching and
`--affected` included.

```sh
uv init --package apps/thing
```

Then `apps/thing/package.json`:

```json
{
  "name": "thing",
  "private": true,
  "scripts": {
    "lint": "uv run --package thing ruff check .",
    "test": "uv run --package thing pytest"
  }
}
```

Then `uv sync`. The root `pyproject.toml` already globs `apps/*` and
`packages/*` as workspace members, so nothing else needs editing.

## Deployment

`apps/site` deploys to Vercel with Root Directory set to `apps/site`. Vercel
does not read `mise.toml`, which is why the root `package.json` also carries
`packageManager` and `engines.node`.
