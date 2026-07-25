import { access, readFile, readdir } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import {
  arrayAt,
  booleanAt,
  isObject,
  objectAt,
  readConfig,
  stringAt,
  type ConfigObject,
} from './config.js'
import { discoverConfigs } from './discover.js'
import type {
  Binding,
  Diagnostic,
  InspectOptions,
  StackEdge,
  StackResult,
  WorkerProject,
} from './types.js'

export const VERSION = '0.1.0'

const ARRAY_BINDINGS: Array<{
  key: string
  type: string
  name: string
  target?: string
}> = [
  { key: 'services', type: 'service', name: 'binding', target: 'service' },
  { key: 'd1_databases', type: 'd1', name: 'binding', target: 'database_name' },
  { key: 'kv_namespaces', type: 'kv', name: 'binding', target: 'id' },
  { key: 'r2_buckets', type: 'r2', name: 'binding', target: 'bucket_name' },
  { key: 'analytics_engine_datasets', type: 'analytics', name: 'binding', target: 'dataset' },
  { key: 'vectorize', type: 'vectorize', name: 'binding', target: 'index_name' },
  { key: 'hyperdrive', type: 'hyperdrive', name: 'binding', target: 'id' },
  { key: 'workflows', type: 'workflow', name: 'binding', target: 'name' },
]

export async function inspectStack(
  inputPath: string,
  options: InspectOptions,
): Promise<StackResult> {
  const root = resolve(inputPath)
  const configPaths = await discoverConfigs(root, options.recursive)
  if (configPaths.length === 0) {
    throw new Error(`No Wrangler configuration found below ${root}.`)
  }

  const diagnostics: Diagnostic[] = []
  const workers: WorkerProject[] = []

  for (const configPath of configPaths) {
    const config = await readConfig(configPath)
    workers.push(await projectFromConfig(configPath, config, options.environment, diagnostics))
  }

  const edges = buildEdges(workers)
  diagnostics.push(...diagnoseServices(workers, edges))
  diagnostics.push(...diagnoseCycles(edges, workers))

  diagnostics.sort((a, b) => {
    const severityOrder = { error: 0, warning: 1, info: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity] || a.file.localeCompare(b.file)
  })

  return {
    root,
    ...(options.environment ? { environment: options.environment } : {}),
    workers,
    edges,
    diagnostics,
    summary: {
      workers: workers.length,
      bindings: workers.reduce((count, worker) => count + worker.bindings.length, 0),
      remoteBindings: workers.reduce(
        (count, worker) => count + worker.bindings.filter((binding) => binding.remote).length,
        0,
      ),
      errors: diagnostics.filter((item) => item.severity === 'error').length,
      warnings: diagnostics.filter((item) => item.severity === 'warning').length,
      infos: diagnostics.filter((item) => item.severity === 'info').length,
    },
  }
}

async function projectFromConfig(
  configPath: string,
  root: ConfigObject,
  environment: string | undefined,
  diagnostics: Diagnostic[],
): Promise<WorkerProject> {
  const directory = dirname(configPath)
  const rootName = stringAt(root, 'name') ?? dirname(configPath).split('/').pop() ?? 'worker'
  const envs = objectAt(root, 'env')
  const selected = environment && envs ? objectAt(envs, environment) : undefined

  if (environment && !selected) {
    diagnostics.push({
      rule: 'WD001',
      severity: 'error',
      title: 'Environment is not configured',
      message: `${rootName} has no env.${environment} configuration.`,
      file: configPath,
      worker: rootName,
      fix: `Add env.${environment} or choose one of the configured environments.`,
    })
  }

  const effective = selected ?? root
  const name =
    stringAt(effective, 'name') ?? (environment ? `${rootName}-${environment}` : rootName)
  const bindings = collectBindings(effective)
  const requiredSecrets = requiredSecretNames(effective)
  const secretState = await inspectSecretFiles(directory, environment, requiredSecrets)

  if (secretState.hasDevVars && secretState.hasEnv) {
    diagnostics.push({
      rule: 'WD004',
      severity: 'warning',
      title: 'Two local secret systems are present',
      message: `${name} has both .dev.vars and .env files. Wrangler does not load them as one combined source.`,
      file: configPath,
      worker: name,
      fix: 'Choose .dev.vars or .env and remove the other local secret source.',
    })
  }

  if (secretState.missing.length > 0) {
    diagnostics.push({
      rule: 'WD005',
      severity: 'warning',
      title: 'Required local secrets are missing',
      message: `${name} is missing ${secretState.missing.join(', ')} in its selected local secret file.`,
      file: configPath,
      worker: name,
      fix: 'Add the missing names to the local secret file. Workers Doctor never reads or reports their values.',
    })
  }

  const remote = bindings.filter((binding) => binding.remote)
  if (remote.length > 0) {
    diagnostics.push({
      rule: 'WD002',
      severity: 'info',
      title: 'Remote bindings will be used',
      message: `${name} connects ${remote.map((binding) => binding.name).join(', ')} to remote Cloudflare resources during local development.`,
      file: configPath,
      worker: name,
      fix: 'Use staging resources or pass --local to Wrangler when remote access is not intended.',
    })
  }

  const localCount = bindings.filter((binding) => !binding.remote && binding.type !== 'service').length
  if (remote.length > 0 && localCount > 0) {
    diagnostics.push({
      rule: 'WD003',
      severity: 'warning',
      title: 'Local and remote state are mixed',
      message: `${name} combines ${remote.length} remote binding${remote.length === 1 ? '' : 's'} with ${localCount} locally simulated binding${localCount === 1 ? '' : 's'}.`,
      file: configPath,
      worker: name,
      fix: 'Confirm that this mixed state is intentional before starting the stack.',
    })
  }

  const serviceTargets = bindings
    .filter((binding) => binding.type === 'service' && binding.target)
    .map((binding) => binding.target as string)

  return {
    configPath,
    directory,
    rootName,
    name,
    bindings,
    serviceTargets,
    requiredSecrets,
    ...(environment ? { environment } : {}),
  }
}

function collectBindings(config: ConfigObject): Binding[] {
  const bindings: Binding[] = []

  for (const descriptor of ARRAY_BINDINGS) {
    for (const item of arrayAt(config, descriptor.key)) {
      const name = stringAt(item, descriptor.name)
      if (!name) continue
      const target = descriptor.target ? stringAt(item, descriptor.target) : undefined
      bindings.push({
        type: descriptor.type,
        name,
        remote: booleanAt(item, 'remote'),
        ...(target ? { target } : {}),
      })
    }
  }

  const queues = objectAt(config, 'queues')
  if (queues) {
    for (const item of arrayAt(queues, 'producers')) {
      const name = stringAt(item, 'binding')
      if (!name) continue
      const target = stringAt(item, 'queue')
      bindings.push({
        type: 'queue',
        name,
        remote: booleanAt(item, 'remote'),
        ...(target ? { target } : {}),
      })
    }
  }

  const durableObjects = objectAt(config, 'durable_objects')
  if (durableObjects) {
    for (const item of arrayAt(durableObjects, 'bindings')) {
      const name = stringAt(item, 'name')
      if (!name) continue
      const target = stringAt(item, 'class_name')
      bindings.push({
        type: 'durable-object',
        name,
        remote: booleanAt(item, 'remote'),
        ...(target ? { target } : {}),
      })
    }
  }

  for (const descriptor of [
    { key: 'ai', type: 'workers-ai' },
    { key: 'browser', type: 'browser' },
    { key: 'images', type: 'images' },
  ]) {
    const item = objectAt(config, descriptor.key)
    if (!item) continue
    const name = stringAt(item, 'binding')
    if (name) bindings.push({ type: descriptor.type, name, remote: booleanAt(item, 'remote') })
  }

  return bindings.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
}

function requiredSecretNames(config: ConfigObject): string[] {
  const secrets = objectAt(config, 'secrets')
  if (!secrets) return []
  const required = secrets.required
  return Array.isArray(required)
    ? required.filter((value): value is string => typeof value === 'string').sort()
    : []
}

async function inspectSecretFiles(
  directory: string,
  environment: string | undefined,
  required: string[],
): Promise<{ hasDevVars: boolean; hasEnv: boolean; missing: string[] }> {
  const names: string[] = await readdir(directory).catch(() => [])
  const devCandidates = environment
    ? [`.dev.vars.${environment}`, '.dev.vars']
    : ['.dev.vars']
  const envCandidates = environment
    ? [`.env.${environment}.local`, '.env.local', `.env.${environment}`, '.env']
    : ['.env.local', '.env']
  const devFile = devCandidates.find((name) => names.includes(name))
  const envFiles = envCandidates.filter((name) => names.includes(name))
  const keys = new Set<string>()

  if (devFile) {
    addDotEnvKeys(keys, await readFile(resolve(directory, devFile), 'utf8'))
  } else {
    for (const file of envFiles.reverse()) {
      addDotEnvKeys(keys, await readFile(resolve(directory, file), 'utf8'))
    }
  }

  return {
    hasDevVars: names.some((name) => name === '.dev.vars' || name.startsWith('.dev.vars.')),
    hasEnv: names.some((name) => name === '.env' || name.startsWith('.env.')),
    missing: required.filter((name) => !keys.has(name)),
  }
}

function addDotEnvKeys(keys: Set<string>, source: string): void {
  for (const line of source.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line)
    if (match?.[1]) keys.add(match[1])
  }
}

function buildEdges(workers: WorkerProject[]): StackEdge[] {
  return workers.flatMap((worker) =>
    worker.bindings
      .filter((binding) => binding.target)
      .map((binding) => ({
        from: worker.name,
        to: binding.target as string,
        label: `${binding.type}:${binding.name}`,
        remote: binding.remote,
      })),
  )
}

function diagnoseServices(workers: WorkerProject[], edges: StackEdge[]): Diagnostic[] {
  const names = new Set(workers.map((worker) => worker.name))
  const byName = new Map(workers.map((worker) => [worker.name, worker]))
  return edges
    .filter((edge) => edge.label.startsWith('service:') && !names.has(edge.to))
    .map((edge) => {
      const worker = byName.get(edge.from)
      return {
        rule: 'WD006',
        severity: 'warning' as const,
        title: 'Service binding target is outside the stack',
        message: `${edge.from} points to ${edge.to}, but no scanned Worker resolves to that name.`,
        file: worker?.configPath ?? '',
        worker: edge.from,
        fix: 'Scan the target Worker too, or confirm that the binding intentionally points to a deployed service.',
      }
    })
}

function diagnoseCycles(edges: StackEdge[], workers: WorkerProject[]): Diagnostic[] {
  const serviceEdges = edges.filter((edge) => edge.label.startsWith('service:'))
  const graph = new Map<string, string[]>()
  for (const edge of serviceEdges) {
    const targets = graph.get(edge.from) ?? []
    targets.push(edge.to)
    graph.set(edge.from, targets)
  }

  const cycles = new Set<string>()
  for (const worker of workers) {
    findCycles(worker.name, worker.name, graph, [], cycles)
  }

  return [...cycles].map((cycle) => {
    const first = cycle.split(' -> ')[0] ?? ''
    const worker = workers.find((item) => item.name === first)
    return {
      rule: 'WD007',
      severity: 'warning',
      title: 'Service binding cycle detected',
      message: cycle,
      file: worker?.configPath ?? '',
      ...(first ? { worker: first } : {}),
      fix: 'Confirm that the cycle is intentional and that every RPC or fetch call terminates.',
    }
  })
}

function findCycles(
  start: string,
  current: string,
  graph: Map<string, string[]>,
  path: string[],
  cycles: Set<string>,
): void {
  if (path.includes(current)) return
  const nextPath = [...path, current]
  for (const target of graph.get(current) ?? []) {
    if (target === start && nextPath.length > 1) {
      cycles.add([...nextPath, start].join(' -> '))
    } else if (nextPath.length < graph.size + 1) {
      findCycles(start, target, graph, nextPath, cycles)
    }
  }
}

export function relativeResult(result: StackResult): StackResult {
  return {
    ...result,
    workers: result.workers.map((worker) => ({
      ...worker,
      configPath: relative(result.root, worker.configPath) || worker.configPath,
      directory: relative(result.root, worker.directory) || '.',
    })),
    diagnostics: result.diagnostics.map((item) => ({
      ...item,
      file: relative(result.root, item.file) || item.file,
    })),
  }
}

export async function pathExists(path: string): Promise<boolean> {
  return access(path).then(
    () => true,
    () => false,
  )
}

export function configHasEnvironment(config: ConfigObject, environment: string): boolean {
  const env = objectAt(config, 'env')
  return Boolean(env && isObject(env[environment]))
}
