import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { inspectStack, relativeResult } from '../src/analyze.js'

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
    const temporary = await mkdtemp(join(tmpdir(), 'workers-doctor-risky-'))
    try {
      await mkdir(join(temporary, 'apps/api'), { recursive: true })
      await mkdir(join(temporary, 'apps/worker'), { recursive: true })
      await writeFile(
        join(temporary, 'apps/api/wrangler.jsonc'),
        await readFile(`${fixtures}/risky/apps/api/wrangler.jsonc`, 'utf8'),
      )
      await writeFile(
        join(temporary, 'apps/worker/wrangler.toml'),
        await readFile(`${fixtures}/risky/apps/worker/wrangler.toml`, 'utf8'),
      )
      await writeFile(join(temporary, 'apps/api/.dev.vars'), 'UNRELATED_NAME=\n')
      await writeFile(join(temporary, 'apps/api/.env'), 'ANOTHER_NAME=\n')

      const result = await inspectStack(temporary, { recursive: true })
      const rules = result.diagnostics.map((item) => item.rule)

      expect(rules).toContain('WD002')
      expect(rules).toContain('WD003')
      expect(rules).toContain('WD004')
      expect(rules).toContain('WD005')
      expect(rules).toContain('WD006')
      expect(rules).toContain('WD007')
      expect(result.diagnostics.filter((item) => item.rule === 'WD007')).toHaveLength(1)
    } finally {
      await rm(temporary, { recursive: true })
    }
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

  it('uses the configuration directory as root for a single file', async () => {
    const result = relativeResult(await inspectStack(
      `${fixtures}/healthy/apps/api/wrangler.jsonc`,
      { recursive: true },
    ))

    expect(result.root).toBe(resolve(fixtures, 'healthy/apps/api'))
    expect(result.workers[0]?.configPath).toBe('wrangler.jsonc')
    expect(result.workers[0]?.directory).toBe('.')
  })

  it('recognizes current Wrangler binding families', async () => {
    const result = await inspectStack(`${fixtures}/bindings`, { recursive: true })

    expect(result.workers[0]?.bindings.map((binding) => binding.type)).toEqual([
      'agent-memory',
      'ai-search',
      'assets',
      'pipeline',
      'version-metadata',
      'vpc-service',
    ])
    expect(result.summary.remoteBindings).toBe(3)
  })

  it('blocks duplicate effective names and reports self-cycles', async () => {
    const temporary = await mkdtemp(join(tmpdir(), 'workers-doctor-duplicates-'))
    try {
      await mkdir(join(temporary, 'api'), { recursive: true })
      await mkdir(join(temporary, 'other'), { recursive: true })
      const config = JSON.stringify({
        name: 'duplicate',
        services: [{ binding: 'SELF', service: 'duplicate' }],
      })
      await writeFile(join(temporary, 'api/wrangler.json'), config)
      await writeFile(join(temporary, 'other/wrangler.json'), config)

      const result = await inspectStack(temporary, { recursive: true })

      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ rule: 'WD008', severity: 'error' }),
      )
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ rule: 'WD007', message: 'duplicate -> duplicate' }),
      )
    } finally {
      await rm(temporary, { recursive: true })
    }
  })
})
