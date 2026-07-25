import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'
import { parse as parseJsonc, printParseErrorCode, type ParseError } from 'jsonc-parser'
import { parse as parseToml } from 'smol-toml'

export type ConfigObject = Record<string, unknown>

export class ConfigError extends Error {
  constructor(
    message: string,
    readonly filePath: string,
  ) {
    super(message)
  }
}

export async function readConfig(filePath: string): Promise<ConfigObject> {
  const source = await readFile(filePath, 'utf8')
  try {
    if (extname(filePath) === '.toml') {
      return parseToml(source) as ConfigObject
    }

    const errors: ParseError[] = []
    const value = parseJsonc(source, errors, { allowTrailingComma: true })
    if (errors.length > 0) {
      const first = errors[0]
      throw new Error(first ? printParseErrorCode(first.error) : 'Invalid JSONC')
    }
    if (!isObject(value)) throw new Error('Configuration root must be an object')
    return value
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new ConfigError(`Could not parse ${filePath}: ${message}`, filePath)
  }
}

export function isObject(value: unknown): value is ConfigObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function objectAt(object: ConfigObject, key: string): ConfigObject | undefined {
  const value = object[key]
  return isObject(value) ? value : undefined
}

export function arrayAt(object: ConfigObject, key: string): ConfigObject[] {
  const value = object[key]
  return Array.isArray(value) ? value.filter(isObject) : []
}

export function stringAt(object: ConfigObject, key: string): string | undefined {
  const value = object[key]
  return typeof value === 'string' ? value : undefined
}

export function booleanAt(object: ConfigObject, key: string): boolean {
  return object[key] === true
}

