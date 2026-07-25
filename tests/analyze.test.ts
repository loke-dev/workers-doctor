import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { inspectStack } from '../src/analyze.js'

const fixtures = fileURLToPath(new URL('./fixtures/', import.meta.url))

describe('inspectStack', () => {
  it('resolves a healthy named environment and service graph', async () => {
    const result = await inspectStack(`${fixtures}/healthy`, {
      recursive: true,
      environment: 'staging',
    })

    expect(result.summary).toMatchObject({
      workers: 2,
      bindings: 3,
      remoteBindings: 1,
      errors: 0,
      warnings: 0,
    })
    expect(result.workers.map((worker) => worker.name)).toEqual([
      'doctor-api-staging',
      'doctor-auth-staging',
    ])
    expect(result.edges).toContainEqual({
      from: 'doctor-api-staging',
      to: 'doctor-auth-staging',
      label: 'service:AUTH',
      remote: false,
    })
  })

  it('reports secret, service, cycle, and mixed-state problems', async () => {
    const result = await inspectStack(`${fixtures}/risky`, { recursive: true })
    const rules = result.diagnostics.map((item) => item.rule)

    expect(rules).toContain('WD002')
    expect(rules).toContain('WD003')
    expect(rules).toContain('WD004')
    expect(rules).toContain('WD005')
    expect(rules).toContain('WD006')
    expect(rules).toContain('WD007')
  })

  it('reports an absent selected environment', async () => {
    const result = await inspectStack(`${fixtures}/risky`, {
      recursive: true,
      environment: 'staging',
    })
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ rule: 'WD001', severity: 'error' }),
    )
  })
})
