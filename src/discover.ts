import { readdir, stat } from 'node:fs/promises'
import { basename, resolve } from 'node:path'

const CONFIG_NAMES = new Set(['wrangler.jsonc', 'wrangler.json', 'wrangler.toml'])
const SKIP_DIRECTORIES = new Set([
  '.git',
  '.wrangler',
  'build',
  'coverage',
  'dist',
  'node_modules',
  '.next',
  '.output',
])

export async function discoverConfigs(inputPath: string, recursive: boolean): Promise<string[]> {
  const absolute = resolve(inputPath)
  const info = await stat(absolute)
  if (info.isFile()) {
    if (!CONFIG_NAMES.has(basename(absolute))) {
      throw new Error(`${absolute} is not a Wrangler configuration file.`)
    }
    return [absolute]
  }

  const results: string[] = []
  await walk(absolute, recursive, results)
  return results.sort()
}

async function walk(directory: string, recursive: boolean, results: string[]): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    const path = resolve(directory, entry.name)
    if (entry.isFile() && CONFIG_NAMES.has(entry.name)) {
      results.push(path)
    } else if (recursive && entry.isDirectory() && !SKIP_DIRECTORIES.has(entry.name)) {
      await walk(path, true, results)
    }
  }
}

