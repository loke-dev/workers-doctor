import { describe, expect, it } from 'vitest'
import { runDevCommands } from '../src/dev.js'

describe('runDevCommands', () => {
  it('finishes immediately when there are no commands', async () => {
    await expect(runDevCommands([])).resolves.toBe(0)
  })
})
