# Workers Doctor

Inspect and safely run multi-Worker Cloudflare projects.

[![npm version](https://img.shields.io/npm/v/workers-doctor?color=0f766e)](https://www.npmjs.com/package/workers-doctor)
[![CI](https://github.com/loke-dev/workers-doctor/actions/workflows/ci.yml/badge.svg)](https://github.com/loke-dev/workers-doctor/actions/workflows/ci.yml)
[![CodeQL](https://github.com/loke-dev/workers-doctor/actions/workflows/codeql.yml/badge.svg)](https://github.com/loke-dev/workers-doctor/actions/workflows/codeql.yml)
[![MIT license](https://img.shields.io/badge/license-MIT-171816)](LICENSE)

[Website](https://workers-doctor.loke.dev) · [GitHub Action](#github-actions) · [Report an issue](https://github.com/loke-dev/workers-doctor/issues)

Workers Doctor turns a directory of Wrangler files into one understandable
development plan. It resolves the selected environment, maps service, tail
consumer, and resource bindings, includes variables and legacy module bindings
in collision checks, identifies local and remote state, checks secret names
from local files and the process environment, and can start the stack only
after the plan is visible.

```console
$ npx workers-doctor inspect --env staging

Workers Doctor
2 workers · 3 bindings · 1 remote
Environment: staging

doctor-api-staging  apps/api/wrangler.jsonc
  d1               DB → doctor-preview  remote
  service          AUTH → doctor-auth-staging  local

doctor-auth-staging  apps/auth/wrangler.jsonc
  kv                SESSIONS → local-id  local

i NOTICE WD002  Remote bindings will be used
```

## Inspect a stack

```sh
npx workers-doctor
npx workers-doctor ./apps --env staging
npx workers-doctor --json
npx workers-doctor --github --strict
npx workers-doctor graph > workers.dot
```

Wrangler JSONC, JSON, and TOML configurations are supported. Common generated
directories are skipped during discovery, including framework output from
Astro, Next.js, Nuxt, SvelteKit, and Vercel.

## Start the development plan

Preview the exact processes and ports first:

```sh
npx workers-doctor dev --env staging --dry-run
```

Then start every discovered Worker in dependency order:

```sh
npx workers-doctor dev --env staging
```

Use `-p` (or `--port`) to shift the local port range when 8787 is already in use:

```sh
npx workers-doctor dev --env staging --dry-run -p 9000
```

Workers Doctor uses the repository's lockfile to select pnpm, npm, Bun, or Yarn.
It stops the remaining processes and exits nonzero if any managed Worker fails
or is terminated unexpectedly. Processes that ignore graceful shutdown are
force-stopped after a short grace period. Workers Doctor does not deploy, create
resources, or call the Cloudflare API.

## GitHub Actions

```yaml
- uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7
- uses: loke-dev/workers-doctor@v0.1.5
  with:
    environment: staging
```

The reusable Action annotates configuration problems and fails on errors. Its
inputs are `path`, `environment`, and `strict`. It runs the reviewed CLI bundle
from the selected repository tag without downloading executable code from npm.

## Diagnostics

| Rule | Check |
| --- | --- |
| `WD001` | Selected environment exists in every scanned Worker |
| `WD002` | Remote bindings are clearly reported |
| `WD003` | Local and remote state are not mixed accidentally |
| `WD004` | A project does not mix `.dev.vars` and `.env` |
| `WD005` | Names declared in `secrets.required` exist in local secret sources |
| `WD006` | Service and tail-consumer targets resolve inside the scanned stack |
| `WD007` | Service binding cycles, including self-cycles, are visible |
| `WD008` | Effective Worker names are unique inside the scanned stack |
| `WD009` | Binding names are unique inside each Worker |

Secret values are never reported. `inspect`, `graph`, and CI output are fully
offline and require no Cloudflare account. Secret-file checks consider only the
files Wrangler selects for the requested environment. Parse failures omit TOML
source excerpts so malformed configuration values cannot enter diagnostics.
Human and GitHub reports render configuration control characters visibly so
Worker and binding names cannot inject terminal or workflow-command output.

## Development

```sh
pnpm install
pnpm check
pnpm dist:check
pnpm dev -- tests/fixtures/healthy --env staging
pnpm site:dev
```

`pnpm check` includes a `dist` verification step, and `pnpm dist:check` is a
small standalone command if you only need to confirm the committed CLI bundle is
up-to-date.

## License

MIT
