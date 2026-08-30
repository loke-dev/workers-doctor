import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { inspectStack, relativeResult } from '../src/analyze.js'
import { ConfigError } from '../src/config.js'

const fixtures = fileURLToPath(new URL('./fixtures/', import.meta.url))

describe('inspectStack', () => {
  it('classifies missing paths and empty scan roots as input errors', async () => {
    const temporary = await mkdtemp(join(tmpdir(), 'workers-doctor-empty-'))
    try {
      const unrelatedFile = join(temporary, 'notes.txt')
      await writeFile(unrelatedFile, 'not a Wrangler configuration')
      await expect(
        inspectStack(join(temporary, 'missing'), { recursive: true }),
      ).rejects.toBeInstanceOf(ConfigError)
      await expect(
        inspectStack(unrelatedFile, { recursive: true }),
      ).rejects.toMatchObject({
        filePath: unrelatedFile,
        message: `${unrelatedFile} is not a Wrangler configuration file.`,
      })
      await expect(
        inspectStack(temporary, { recursive: true }),
      ).rejects.toBeInstanceOf(ConfigError)
    } finally {
      await rm(temporary, { recursive: true })
    }
  })

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

  it('ignores secret files for other environments when checking mixed systems', async () => {
    const temporary = await mkdtemp(join(tmpdir(), 'workers-doctor-secrets-'))
    try {
      await writeFile(
        join(temporary, 'wrangler.json'),
        JSON.stringify({ name: 'multi-env', env: { staging: {} } }),
      )
      await writeFile(join(temporary, '.dev.vars.staging'), 'STAGING_SECRET=\n')
      await writeFile(join(temporary, '.env.production'), 'PRODUCTION_SECRET=\n')

      const staging = await inspectStack(temporary, {
        recursive: true,
        environment: 'staging',
      })
      expect(staging.diagnostics).not.toContainEqual(
        expect.objectContaining({ rule: 'WD004' }),
      )

      await writeFile(join(temporary, '.env.staging'), 'STAGING_OTHER=\n')
      const mixed = await inspectStack(temporary, {
        recursive: true,
        environment: 'staging',
      })
      expect(mixed.diagnostics).toContainEqual(
        expect.objectContaining({ rule: 'WD004' }),
      )
    } finally {
      await rm(temporary, { recursive: true })
    }
  })

  it('accepts required secrets supplied through the process environment', async () => {
    const temporary = await mkdtemp(join(tmpdir(), 'workers-doctor-process-secret-'))
    const secretName = 'WORKERS_DOCTOR_PROCESS_SECRET'
    const previous = process.env[secretName]
    try {
      await writeFile(
        join(temporary, 'wrangler.json'),
        JSON.stringify({
          name: 'process-secret-worker',
          secrets: { required: [secretName] },
        }),
      )
      process.env[secretName] = 'test-value'

      const result = await inspectStack(temporary, { recursive: true })

      expect(result.diagnostics).not.toContainEqual(
        expect.objectContaining({ rule: 'WD005' }),
      )
      expect(JSON.stringify(result)).not.toContain('test-value')
    } finally {
      if (previous === undefined) delete process.env[secretName]
      else process.env[secretName] = previous
      await rm(temporary, { recursive: true })
    }
  })

  it('keeps reported paths relative to the scan root', async () => {
    const result = relativeResult(await inspectStack(
      `${fixtures}/healthy/apps/api/wrangler.jsonc`,
      { recursive: true },
    ))

    expect(result.root).toBe('.')
    expect(result.workers[0]?.configPath).toBe('wrangler.jsonc')
    expect(result.workers[0]?.directory).toBe('.')
  })

  it('ignores Wrangler files inside framework build directories', async () => {
    const temporary = await mkdtemp(join(tmpdir(), 'workers-doctor-generated-'))
    try {
      await writeFile(
        join(temporary, 'wrangler.json'),
        JSON.stringify({ name: 'source-worker' }),
      )
      for (const directory of ['.astro', '.next', '.nuxt', '.output', '.svelte-kit', '.vercel']) {
        await mkdir(join(temporary, directory), { recursive: true })
        await writeFile(
          join(temporary, directory, 'wrangler.json'),
          JSON.stringify({ name: `generated-${directory}` }),
        )
      }

      const result = await inspectStack(temporary, { recursive: true })

      expect(result.workers.map((worker) => worker.name)).toEqual(['source-worker'])
    } finally {
      await rm(temporary, { recursive: true })
    }
  })

  it('recognizes current Wrangler binding families', async () => {
    const result = await inspectStack(`${fixtures}/bindings`, { recursive: true })

    expect(result.workers[0]?.bindings.map((binding) => binding.type)).toEqual([
      'agent-memory',
      'ai-search',
      'assets',
      'data-blob',
      'log-forwarder',
      'pipeline',
      'stream',
      'text-blob',
      'unsafe',
      'var',
      'version-metadata',
      'vpc-service',
      'wasm-module',
    ])
    expect(result.summary).toMatchObject({ bindings: 13, remoteBindings: 4 })
  })

  it('recognizes tail consumers as worker targets without local-state warnings', async () => {
    const temporary = await mkdtemp(join(tmpdir(), 'workers-doctor-tail-consumer-'))
    try {
      await writeFile(
        join(temporary, 'wrangler.json'),
        JSON.stringify({
          name: 'producer',
          tail_consumers: [{ service: 'tail-worker' }],
          streaming_tail_consumers: [{ service: 'streaming-tail-worker' }],
          kv_namespaces: [{ binding: 'CACHE', id: 'remote-id', remote: true }],
        }),
      )

      const result = await inspectStack(temporary, { recursive: true })

      expect(result.workers[0]?.bindings).toContainEqual({
        type: 'tail-consumer',
        name: 'tail-worker',
        target: 'tail-worker',
        remote: false,
      })
      expect(result.edges).toContainEqual({
        from: 'producer',
        to: 'tail-worker',
        label: 'tail-consumer:tail-worker',
        remote: false,
      })
      expect(result.workers[0]?.bindings).toContainEqual({
        type: 'streaming-tail-consumer',
        name: 'streaming-tail-worker',
        target: 'streaming-tail-worker',
        remote: false,
      })
      expect(result.edges).toContainEqual({
        from: 'producer',
        to: 'streaming-tail-worker',
        label: 'streaming-tail-consumer:streaming-tail-worker',
        remote: false,
      })
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ rule: 'WD006', severity: 'warning' }),
      )
      expect(result.diagnostics.filter((item) => item.rule === 'WD006')).toHaveLength(2)
      expect(result.diagnostics).not.toContainEqual(
        expect.objectContaining({ rule: 'WD003' }),
      )
    } finally {
      await rm(temporary, { recursive: true })
    }
  })

  it('maps Queue producers and consumer triggers to queue edges', async () => {
    const temporary = await mkdtemp(join(tmpdir(), 'workers-doctor-queue-'))
    try {
      await mkdir(join(temporary, 'consumer'), { recursive: true })
      await writeFile(
        join(temporary, 'wrangler.json'),
        JSON.stringify({
          name: 'producer',
          queues: {
            producers: [{ binding: 'EVENTS', queue: 'events', remote: true }],
          },
        }),
      )
      await writeFile(
        join(temporary, 'consumer/wrangler.json'),
        JSON.stringify({
          name: 'consumer',
          queues: { consumers: [{ queue: 'events' }] },
        }),
      )

      const result = await inspectStack(temporary, { recursive: true })
      const consumer = result.workers.find((worker) => worker.name === 'consumer')

      expect(consumer?.bindings).toContainEqual({
        type: 'queue-consumer',
        name: 'events',
        target: 'events',
        remote: false,
      })
      expect(result.edges).toContainEqual({
        from: 'producer',
        to: 'events',
        label: 'queue:EVENTS',
        remote: true,
      })
      expect(result.edges).toContainEqual({
        from: 'consumer',
        to: 'events',
        label: 'queue-consumer:events',
        remote: false,
      })
      expect(result.diagnostics).not.toContainEqual(
        expect.objectContaining({ rule: 'WD003' }),
      )
    } finally {
      await rm(temporary, { recursive: true })
    }
  })

  it('maps the legacy pipeline target field', async () => {
    const temporary = await mkdtemp(join(tmpdir(), 'workers-doctor-pipeline-'))
    try {
      await writeFile(
        join(temporary, 'wrangler.json'),
        JSON.stringify({
          name: 'pipeline-worker',
          pipelines: [{ binding: 'EVENTS', pipeline: 'legacy-stream' }],
        }),
      )

      const result = await inspectStack(temporary, { recursive: true })

      expect(result.edges).toContainEqual({
        from: 'pipeline-worker',
        to: 'legacy-stream',
        label: 'pipeline:EVENTS',
        remote: false,
      })
    } finally {
      await rm(temporary, { recursive: true })
    }
  })

  it('does not treat variables and modules as local resource state', async () => {
    const temporary = await mkdtemp(join(tmpdir(), 'workers-doctor-object-bindings-'))
    try {
      await writeFile(
        join(temporary, 'wrangler.json'),
        JSON.stringify({
          name: 'object-bindings',
          vars: { API_ORIGIN: 'https://example.com' },
          wasm_modules: { PARSER: './parser.wasm' },
          text_blobs: { COPY: './copy.txt' },
          data_blobs: { LOOKUP: './lookup.bin' },
          kv_namespaces: [{ binding: 'CACHE', id: 'remote-id', remote: true }],
        }),
      )

      const result = await inspectStack(temporary, { recursive: true })

      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ rule: 'WD002' }),
      )
      expect(result.diagnostics).not.toContainEqual(
        expect.objectContaining({ rule: 'WD003' }),
      )
    } finally {
      await rm(temporary, { recursive: true })
    }
  })

  it('blocks duplicate Worker and binding names and reports self-cycles', async () => {
    const temporary = await mkdtemp(join(tmpdir(), 'workers-doctor-duplicates-'))
    try {
      await mkdir(join(temporary, 'api'), { recursive: true })
      await mkdir(join(temporary, 'other'), { recursive: true })
      const config = JSON.stringify({
        name: 'duplicate',
        vars: { COLLISION: 'plain-text-value' },
        services: [{ binding: 'COLLISION', service: 'duplicate' }],
      })
      await writeFile(join(temporary, 'api/wrangler.json'), config)
      await writeFile(join(temporary, 'other/wrangler.json'), config)

      const result = await inspectStack(temporary, { recursive: true })

      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ rule: 'WD008', severity: 'error' }),
      )
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({
          rule: 'WD009',
          severity: 'error',
          message: expect.stringContaining('2 bindings named COLLISION'),
        }),
      )
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ rule: 'WD007', message: 'duplicate -> duplicate' }),
      )
    } finally {
      await rm(temporary, { recursive: true })
    }
  })

  it('does not treat trigger targets as duplicate runtime bindings', async () => {
    const temporary = await mkdtemp(join(tmpdir(), 'workers-doctor-trigger-names-'))
    try {
      await writeFile(
        join(temporary, 'wrangler.json'),
        JSON.stringify({
          name: 'trigger-overlap',
          services: [{ binding: 'tail-worker', service: 'tail-worker' }],
          tail_consumers: [{ service: 'tail-worker' }],
          streaming_tail_consumers: [{ service: 'tail-worker' }],
          queues: {
            producers: [{ binding: 'events', queue: 'events' }],
            consumers: [{ queue: 'events' }],
          },
        }),
      )

      const result = await inspectStack(temporary, { recursive: true })

      expect(result.diagnostics).not.toContainEqual(
        expect.objectContaining({ rule: 'WD009' }),
      )
    } finally {
      await rm(temporary, { recursive: true })
    }
  })
})
