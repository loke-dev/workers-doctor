import { describe, expect, it } from 'vitest'
import { CliArgumentError, parseArgs } from '../src/options.js'

describe('parseArgs', () => {
  it('parses inspect options', () => {
    expect(parseArgs(['inspect', './apps', '--env', 'staging', '--json', '--strict'])).toMatchObject({
      command: 'inspect',
      inputPath: './apps',
      environment: 'staging',
      format: 'json',
      strict: true,
    })
  })

  it('selects dot output for graph', () => {
    expect(parseArgs(['graph'])).toMatchObject({ command: 'graph', format: 'dot' })
  })

  it('validates ports', () => {
    expect(() => parseArgs(['dev', '--port', '70000'])).toThrow(CliArgumentError)
    expect(() => parseArgs(['dev', '--port', '8787abc'])).toThrow(CliArgumentError)
    expect(() => parseArgs(['dev', '--port', '1.5'])).toThrow(CliArgumentError)
    expect(() => parseArgs(['dev', '-p', '70000'])).toThrow(CliArgumentError)
    expect(() => parseArgs(['dev', '-p'])).toThrow('requires a value.')
    expect(parseArgs(['dev', '-p', '8080']).startPort).toBe(8080)
  })

  it('rejects options that the selected command cannot honor', () => {
    expect(() => parseArgs(['inspect', '--dry-run'])).toThrow(
      '--dry-run is only valid with the dev command.',
    )
    expect(() => parseArgs(['inspect', '--port', '8788'])).toThrow(
      '--port is only valid with the dev command.',
    )
    expect(() => parseArgs(['dev', '--json'])).toThrow(
      'Output format options are not supported with the dev command.',
    )
    expect(() => parseArgs(['graph', '--github'])).toThrow(
      'The graph command only supports dot output.',
    )
  })

  it('rejects unknown arguments', () => {
    expect(() => parseArgs(['--wat'])).toThrow('Unknown option')
  })
})
