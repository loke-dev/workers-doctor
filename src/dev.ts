import { spawn, type ChildProcess } from 'node:child_process'
import { access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { StackResult, WorkerProject } from './types.js'

export interface DevCommand {
  worker: string
  cwd: string
  command: string
  args: string[]
  port: number
}

export async function buildDevCommands(
  result: StackResult,
  startPort: number,
): Promise<DevCommand[]> {
  const ordered = orderWorkers(result)
  return Promise.all(
    ordered.map(async (worker, index) => {
      const runner = await detectRunner(worker)
      const args = [
        ...runner.prefix,
        'wrangler',
        'dev',
        '-c',
        worker.configPath,
        '--port',
        String(startPort + index),
      ]
      if (worker.environment) args.push('-e', worker.environment)
      return {
        worker: worker.name,
        cwd: worker.directory,
        command: runner.command,
        args,
        port: startPort + index,
      }
    }),
  )
}

async function detectRunner(
  worker: WorkerProject,
): Promise<{ command: string; prefix: string[] }> {
  const candidates: Array<{
    marker: string
    command: string
    prefix: string[]
  }> = [
    { marker: 'pnpm-lock.yaml', command: 'pnpm', prefix: ['exec'] },
    { marker: 'package-lock.json', command: 'npm', prefix: ['exec', '--'] },
    { marker: 'bun.lock', command: 'bunx', prefix: [] },
    { marker: 'bun.lockb', command: 'bunx', prefix: [] },
    { marker: 'yarn.lock', command: 'yarn', prefix: [] },
  ]

  let directory = worker.directory
  for (let depth = 0; depth < 8; depth += 1) {
    for (const candidate of candidates) {
      if (await exists(join(directory, candidate.marker))) {
        return { command: candidate.command, prefix: candidate.prefix }
      }
    }
    const parent = dirname(directory)
    if (parent === directory) break
    directory = parent
  }

  return { command: 'npx', prefix: ['--no-install'] }
}

function orderWorkers(result: StackResult): WorkerProject[] {
  const byName = new Map(result.workers.map((worker) => [worker.name, worker]))
  const visited = new Set<string>()
  const active = new Set<string>()
  const output: WorkerProject[] = []

  const visit = (worker: WorkerProject): void => {
    if (visited.has(worker.name) || active.has(worker.name)) return
    active.add(worker.name)
    for (const target of worker.serviceTargets) {
      const dependency = byName.get(target)
      if (dependency) visit(dependency)
    }
    active.delete(worker.name)
    visited.add(worker.name)
    output.push(worker)
  }

  for (const worker of result.workers) visit(worker)
  return output
}

export function formatDevPlan(commands: DevCommand[]): string {
  const lines = ['Development plan', '']
  for (const item of commands) {
    lines.push(`${item.worker.padEnd(24)} http://localhost:${item.port}`)
    lines.push(`  ${shellCommand(item.command, item.args)}`)
  }
  return `${lines.join('\n')}\n`
}

export async function runDevCommands(commands: DevCommand[]): Promise<number> {
  if (commands.length === 0) return 0

  const children: ChildProcess[] = []
  let closing = false

  const stop = (): void => {
    if (closing) return
    closing = true
    for (const child of children) child.kill('SIGTERM')
  }

  return new Promise((resolve) => {
    let remaining = commands.length
    let exitCode = 0
    let resolved = false

    const finish = (): void => {
      if (resolved || remaining !== 0) return
      resolved = true
      process.removeListener('SIGINT', stop)
      process.removeListener('SIGTERM', stop)
      resolve(exitCode)
    }

    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)

    for (const item of commands) {
      const child = spawn(item.command, item.args, {
        cwd: item.cwd,
        stdio: 'inherit',
        env: process.env,
      })
      children.push(child)
      child.once('error', () => {
        exitCode = 1
        stop()
      })
      child.once('close', (code) => {
        if (typeof code === 'number' && code !== 0) exitCode = code
        remaining -= 1
        if (!closing && code !== 0) stop()
        finish()
      })
    }
  })
}

function shellCommand(command: string, args: string[]): string {
  return [command, ...args].map(quote).join(' ')
}

function quote(value: string): string {
  return /^[A-Za-z0-9_./:@=-]+$/.test(value) ? value : `'${value.replaceAll("'", "'\\''")}'`
}

function exists(path: string): Promise<boolean> {
  return access(path).then(
    () => true,
    () => false,
  )
}
