import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ConfigError, readConfig } from '../src/config.js'

describe('readConfig', () => {
  it('classifies read failures as configuration errors', async () => {
    const missing = join(tmpdir(), 'workers-doctor-missing', 'wrangler.jsonc')

    const error = await readConfig(missing).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ConfigError)
    expect(error).toMatchObject({ filePath: missing })
    expect((error as Error).message).toContain(`Could not read ${missing}`)
  })

  it('keeps parse failures distinct from read failures', async () => {
    const temporary = await mkdtemp(join(tmpdir(), 'workers-doctor-config-'))
    const config = join(temporary, 'wrangler.jsonc')
    try {
      await writeFile(config, '{ invalid')

      await expect(readConfig(config)).rejects.toThrow(
        `Could not parse ${config}`,
      )
    } finally {
      await rm(temporary, { recursive: true })
    }
  })
})
