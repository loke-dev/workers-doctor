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
  })

  it('rejects unknown arguments', () => {
    expect(() => parseArgs(['--wat'])).toThrow('Unknown option')
  })
})

