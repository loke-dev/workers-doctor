import type { CliOptions, OutputFormat } from './types.js'

export class CliArgumentError extends Error {}

const FORMATS = new Set<OutputFormat>(['human', 'json', 'github', 'dot'])

export function parseArgs(args: string[]): CliOptions {
  let command: CliOptions['command'] = 'inspect'
  let inputPath = '.'
  let environment: string | undefined
  let recursive = true
  let format: OutputFormat = 'human'
  let strict = false
  let color = true
  let dryRun = false
  let startPort = 8787
  let portSpecified = false
  let positionalSeen = false

  const values = [...args]
  const first = values[0]
  if (first === 'inspect' || first === 'graph' || first === 'dev') {
    command = first
    values.shift()
  }
  if (command === 'graph') format = 'dot'

  for (let index = 0; index < values.length; index += 1) {
    const argument = values[index]
    if (!argument) continue

    if (argument === '--env' || argument === '-e') {
      environment = requiredValue(values, ++index, argument)
    } else if (argument === '--format') {
      const value = requiredValue(values, ++index, argument) as OutputFormat
      if (!FORMATS.has(value)) {
        throw new CliArgumentError(`Unknown format "${value}".`)
      }
      format = value
    } else if (argument === '--json') {
      format = 'json'
    } else if (argument === '--github') {
      format = 'github'
    } else if (argument === '--dot') {
      format = 'dot'
    } else if (argument === '--strict') {
      strict = true
    } else if (argument === '--no-color') {
      color = false
    } else if (argument === '--no-recursive') {
      recursive = false
    } else if (argument === '--dry-run') {
      dryRun = true
    } else if (argument === '--port') {
      const value = Number(requiredValue(values, ++index, argument))
      if (!Number.isInteger(value) || value < 1 || value > 65535) {
        throw new CliArgumentError('--port must be an integer between 1 and 65535.')
      }
      startPort = value
      portSpecified = true
    } else if (argument.startsWith('-')) {
      throw new CliArgumentError(`Unknown option "${argument}".`)
    } else if (!positionalSeen) {
      inputPath = argument
      positionalSeen = true
    } else {
      throw new CliArgumentError(`Unexpected argument "${argument}".`)
    }
  }

  if (command !== 'dev' && dryRun) {
    throw new CliArgumentError('--dry-run is only valid with the dev command.')
  }
  if (command !== 'dev' && portSpecified) {
    throw new CliArgumentError('--port is only valid with the dev command.')
  }
  if (command === 'dev' && format !== 'human') {
    throw new CliArgumentError('Output format options are not supported with the dev command.')
  }
  if (command === 'graph' && format !== 'dot') {
    throw new CliArgumentError('The graph command only supports dot output.')
  }

  return {
    command,
    inputPath,
    recursive,
    format,
    strict,
    color,
    dryRun,
    startPort,
    ...(environment ? { environment } : {}),
  }
}

function requiredValue(args: string[], index: number, option: string): string {
  const value = args[index]
  if (!value || value.startsWith('-')) {
    throw new CliArgumentError(`${option} requires a value.`)
  }
  return value
}

export function wantsJson(args: string[]): boolean {
  return args.includes('--json') || args.some((value, index) => value === '--format' && args[index + 1] === 'json')
}
