import { describe, expect, it } from 'vitest'
import { formatDot, formatGitHub, formatHuman } from '../src/report.js'
import type { StackResult } from '../src/types.js'

const result: StackResult = {
  root: '.',
  workers: [
    {
      configPath: 'apps/api/wrangler.jsonc',
      directory: 'apps/api',
      rootName: 'api',
      name: 'api',
      bindings: [{ type: 'service', name: 'AUTH', target: 'auth', remote: false }],
      serviceTargets: ['auth'],
      requiredSecrets: [],
    },
  ],
  edges: [{ from: 'api', to: 'auth', label: 'service:AUTH', remote: false }],
  diagnostics: [
    {
      rule: 'WD006',
      severity: 'warning',
      title: 'Missing target',
      message: 'Target is outside the stack.',
      file: 'apps/api/wrangler.jsonc',
    },
  ],
  summary: {
    workers: 1,
    bindings: 1,
    remoteBindings: 0,
    errors: 0,
    warnings: 1,
    infos: 0,
  },
}

describe('reports', () => {
  it('renders human output', () => {
    expect(formatHuman(result, false)).toContain('Workers Doctor')
    expect(formatHuman(result, false)).toContain('WD006')
  })

  it('renders GitHub annotations', () => {
    expect(formatGitHub(result)).toContain('::warning file=apps/api/wrangler.jsonc')
  })

  it('renders a dot graph', () => {
    expect(formatDot(result)).toContain('"api" -> "auth"')
  })

  it('keeps control characters inside escaped dot labels', () => {
    const unsafeName = 'api"\nmalicious [label="owned"]'
    const unsafeResult: StackResult = {
      ...result,
      workers: result.workers.map((worker) => ({
        ...worker,
        name: unsafeName,
      })),
      edges: [
        {
          from: unsafeName,
          to: 'auth',
          label: 'service:\tAUTH',
          remote: false,
        },
      ],
    }

    const output = formatDot(unsafeResult)
    expect(output).toContain(
      '"api\\"\\nmalicious [label=\\"owned\\"]" [label="api\\"\\nmalicious [label=\\"owned\\"]"];',
    )
    expect(output).toContain('label="service:\\tAUTH"')
    expect(output).not.toContain('\nmalicious')
  })
})
