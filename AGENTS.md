# Workers Doctor repository instructions

Workers Doctor is a TypeScript CLI, npm package, GitHub Action, and static
documentation site for inspecting and safely starting multi-Worker Cloudflare
projects.

- Use Node.js 20+ and the pnpm version declared in `package.json`.
- Keep inspection deterministic and offline. Never require Cloudflare
  credentials for `inspect`, `graph`, or report generation.
- Never read or print secret values. Secret checks may inspect file names and
  variable names only.
- Keep `dev` explicit: print the resolved plan before starting processes and
  never deploy or mutate remote resources.
- Preserve JSON output, rule IDs, exit codes, and Action inputs.
- Add tests for every diagnostic and configuration-shape change.
- Run `pnpm check` for product changes and `pnpm site:build` for site changes.
- Treat npm releases, tags, and deployments as explicit actions.

