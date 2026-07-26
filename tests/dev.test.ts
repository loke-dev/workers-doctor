import { describe, expect, it } from 'vitest'
import { buildDevCommands, runDevCommands } from '../src/dev.js'
import type { StackResult } from '../src/types.js'

describe('runDevCommands', () => {
  it('finishes immediately when there are no commands', async () => {
    await expect(runDevCommands([])).resolves.toBe(0)
  })

  it('fails when a managed process is terminated by a signal', async () => {
    await expect(
      runDevCommands([
        {
          worker: 'signal-test',
          cwd: process.cwd(),
          command: process.execPath,
          args: ['-e', "process.kill(process.pid, 'SIGTERM')"],
          port: 8787,
        },
      ]),
    ).resolves.toBe(1)
  })

  it('fails when a managed process exits cleanly before stack shutdown', async () => {
    await expect(
      runDevCommands([
        {
          worker: 'early-exit-test',
          cwd: process.cwd(),
          command: process.execPath,
          args: ['-e', ''],
          port: 8787,
        },
        {
          worker: 'remaining-worker-test',
          cwd: process.cwd(),
          command: process.execPath,
          args: ['-e', 'setTimeout(() => {}, 500)'],
          port: 8788,
        },
      ]),
    ).resolves.toBe(1)
  })

  it('force stops a managed process that ignores graceful shutdown', async () => {
    const started = Date.now()
    await expect(
      runDevCommands(
        [
          {
            worker: 'ignores-sigterm-test',
            cwd: process.cwd(),
            command: process.execPath,
            args: ['-e', "process.on('SIGTERM', () => {}); setTimeout(() => {}, 10_000)"],
            port: 8787,
          },
          {
            worker: 'early-exit-test',
            cwd: process.cwd(),
            command: process.execPath,
            args: ['-e', 'setTimeout(() => {}, 300)'],
            port: 8788,
          },
        ],
        100,
      ),
    ).resolves.toBe(1)
    expect(Date.now() - started).toBeLessThan(2_000)
  })

  it('rejects a generated port range above 65535', async () => {
    const worker = (name: string): StackResult['workers'][number] => ({
      configPath: `/tmp/${name}/wrangler.jsonc`,
      directory: `/tmp/${name}`,
      rootName: name,
      name,
      bindings: [],
      serviceTargets: [],
      requiredSecrets: [],
    })
    const result: StackResult = {
      root: '/tmp',
      workers: [worker('api'), worker('auth')],
      edges: [],
      diagnostics: [],
      summary: {
        workers: 2,
        bindings: 0,
        remoteBindings: 0,
        errors: 0,
        warnings: 0,
        infos: 0,
      },
    }

    await expect(buildDevCommands(result, 65535)).rejects.toThrow(
      'Port range 65535-65536 exceeds the maximum port 65535.',
    )
  })
})
