# Workers Doctor

Inspect and safely run multi-Worker Cloudflare projects.

[![npm version](https://img.shields.io/npm/v/workers-doctor?color=0f766e)](https://www.npmjs.com/package/workers-doctor)
[![CI](https://github.com/loke-dev/workers-doctor/actions/workflows/ci.yml/badge.svg)](https://github.com/loke-dev/workers-doctor/actions/workflows/ci.yml)
[![MIT license](https://img.shields.io/badge/license-MIT-171816)](LICENSE)

[Website](https://workers-doctor.loke.dev) · [GitHub Marketplace](https://github.com/marketplace/actions/workers-doctor) · [Report an issue](https://github.com/loke-dev/workers-doctor/issues)

Workers Doctor turns a directory of Wrangler files into one understandable
development plan. It resolves the selected environment, maps service and
resource bindings, identifies local and remote state, checks local secret names,
and can start the stack only after the plan is visible.

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
! WARNING WD003  Local and remote state are mixed
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
directories are skipped during discovery.

## Start the development plan

Preview the exact processes and ports first:

```sh
npx workers-doctor dev --env staging --dry-run
```

Then start every discovered Worker in dependency order:

```sh
npx workers-doctor dev --env staging
```

Workers Doctor uses the repository's lockfile to select pnpm, npm, Bun, or Yarn.
It does not deploy, create resources, or call the Cloudflare API.

## GitHub Actions

```yaml
- uses: actions/checkout@v6
- uses: loke-dev/workers-doctor@v0.1.0
  with:
    environment: staging
```

The reusable Action annotates configuration problems and fails on errors. Its
inputs are `path`, `environment`, `strict`, and `version`.

## Diagnostics

| Rule | Check |
| --- | --- |
| `WD001` | Selected environment exists in every scanned Worker |
| `WD002` | Remote bindings are clearly reported |
| `WD003` | Local and remote state are not mixed accidentally |
| `WD004` | A project does not mix `.dev.vars` and `.env` |
| `WD005` | Names declared in `secrets.required` exist locally |
| `WD006` | Service binding targets resolve inside the scanned stack |
| `WD007` | Service binding cycles are visible |

Secret values are never reported. `inspect`, `graph`, and CI output are fully
offline and require no Cloudflare account.

## Development

```sh
pnpm install
pnpm check
pnpm dev -- tests/fixtures/healthy --env staging
pnpm site:dev
```

## License

MIT

