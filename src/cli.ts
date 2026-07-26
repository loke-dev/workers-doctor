#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { inspectStack, relativeResult } from './analyze.js'
import { ConfigError } from './config.js'
import { buildDevCommands, formatDevPlan, runDevCommands } from './dev.js'
import { CliArgumentError, parseArgs, wantsJson } from './options.js'
import { formatDot, formatGitHub, formatHuman } from './report.js'

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(help(await packageVersion()))
    return
  }
  if (args.includes('--version') || args.includes('-v')) {
    process.stdout.write(`${await packageVersion()}\n`)
    return
  }

  try {
    const options = parseArgs(args)
    const rawResult = await inspectStack(options.inputPath, {
      recursive: options.recursive,
      ...(options.environment ? { environment: options.environment } : {}),
    })
    const result = relativeResult(rawResult)

    if (options.command === 'dev') {
      if (result.summary.errors > 0 || (options.strict && result.summary.warnings > 0)) {
        process.stdout.write(formatHuman(result, options.color))
        process.stderr.write(
          options.strict && result.summary.errors === 0
            ? 'Workers Doctor refused to start a stack with warnings in strict mode.\n'
            : 'Workers Doctor refused to start a stack with errors.\n',
        )
        process.exitCode = result.summary.errors > 0 ? 2 : 1
        return
      }
      const commands = await buildDevCommands(rawResult, options.startPort)
      process.stdout.write(formatDevPlan(commands))
      if (!options.dryRun) process.exitCode = await runDevCommands(commands)
      return
    }

    const output =
      options.format === 'json'
        ? `${JSON.stringify(result, null, 2)}\n`
        : options.format === 'github'
          ? formatGitHub(result)
          : options.format === 'dot'
            ? formatDot(result)
            : formatHuman(result, options.color)
    process.stdout.write(output)
    setExitCode(result.summary, options.strict)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (wantsJson(args)) process.stdout.write(`${JSON.stringify({ error: message }, null, 2)}\n`)
    else process.stderr.write(`Workers Doctor: ${message}\n`)
    process.exitCode = error instanceof ConfigError || error instanceof CliArgumentError ? 1 : 2
  }
}

function setExitCode(
  summary: { errors: number; warnings: number },
  strict: boolean,
): void {
  if (summary.errors > 0) process.exitCode = 2
  else if (strict && summary.warnings > 0) process.exitCode = 1
}

async function packageVersion(): Promise<string> {
  const packageFile = fileURLToPath(new URL('../package.json', import.meta.url))
  const parsed: unknown = JSON.parse(await readFile(packageFile, 'utf8'))
  if (
    typeof parsed !== 'object'
    || parsed === null
    || !('version' in parsed)
    || typeof parsed.version !== 'string'
  ) {
    throw new Error('Package version is missing or invalid.')
  }
  return parsed.version
}

function help(version: string): string {
  return `Workers Doctor v${version}

Inspect and safely run multi-Worker Cloudflare projects.

Usage:
  workers-doctor [inspect] [path] [options]
  workers-doctor graph [path] [options]
  workers-doctor dev [path] [options]

Options:
  -e, --env <name>       Resolve a named Workers environment
  --format <human|json|github|dot>
                         Select report output
  --json                 Alias for --format json
  --github               Emit GitHub Actions annotations
  --dot                  Emit a Graphviz dependency graph
  --strict               Fail when warnings are found
  --no-recursive         Inspect only the selected directory
  --dry-run              Print the dev process plan without starting it
  -p, --port <number>    First local port for dev mode (default: 8787)
  --no-color             Disable ANSI colors
  -v, --version
  -h, --help

Exit codes:
  0  Stack is internally consistent
  1  Invalid input, or warnings with --strict
  2  Stack errors or an unexpected failure
`
}

await main()
