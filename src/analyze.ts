import { access, readFile, readdir, stat } from 'node:fs/promises'
import { basename, dirname, relative, resolve } from 'node:path'
import {
  arrayAt,
  booleanAt,
  ConfigError,
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

const ARRAY_BINDINGS: Array<{
  key: string
  type: string
  name: string
  target?: string
}> = [
  { key: 'services', type: 'service', name: 'binding', target: 'service' },
  { key: 'agent_memory', type: 'agent-memory', name: 'binding', target: 'namespace' },
  { key: 'ai_search', type: 'ai-search', name: 'binding', target: 'instance_name' },
  { key: 'ai_search_namespaces', type: 'ai-search-namespace', name: 'binding', target: 'namespace' },
  { key: 'd1_databases', type: 'd1', name: 'binding', target: 'database_name' },
  { key: 'artifacts', type: 'artifacts', name: 'binding', target: 'namespace' },
  { key: 'kv_namespaces', type: 'kv', name: 'binding', target: 'id' },
  { key: 'r2_buckets', type: 'r2', name: 'binding', target: 'bucket_name' },
  { key: 'analytics_engine_datasets', type: 'analytics', name: 'binding', target: 'dataset' },
  { key: 'vectorize', type: 'vectorize', name: 'binding', target: 'index_name' },
  { key: 'hyperdrive', type: 'hyperdrive', name: 'binding', target: 'id' },
  { key: 'workflows', type: 'workflow', name: 'binding', target: 'name' },
  { key: 'mtls_certificates', type: 'mtls-certificate', name: 'binding', target: 'certificate_id' },
  { key: 'dispatch_namespaces', type: 'dispatch-namespace', name: 'binding', target: 'namespace' },
  { key: 'pipelines', type: 'pipeline', name: 'binding', target: 'stream' },
  { key: 'ratelimits', type: 'rate-limit', name: 'name', target: 'namespace_id' },
  { key: 'vpc_services', type: 'vpc-service', name: 'binding', target: 'service_id' },
  { key: 'send_email', type: 'email', name: 'name' },
  { key: 'flagship', type: 'flagship', name: 'binding', target: 'app_id' },
  { key: 'secrets_store_secrets', type: 'secret-store', name: 'binding', target: 'store_id' },
  { key: 'vpc_networks', type: 'vpc-network', name: 'binding' },
  { key: 'worker_loaders', type: 'worker-loader', name: 'binding' },
]

const OBJECT_BINDINGS = [
  { key: 'vars', type: 'var' },
  { key: 'wasm_modules', type: 'wasm-module' },
  { key: 'text_blobs', type: 'text-blob' },
  { key: 'data_blobs', type: 'data-blob' },
] as const

const NON_STATE_BINDINGS = new Set([
  'service',
  ...OBJECT_BINDINGS.map((binding) => binding.type),
])

export async function inspectStack(
  inputPath: string,
  options: InspectOptions,
): Promise<StackResult> {
  const input = resolve(inputPath)
  let inputInfo
  try {
    inputInfo = await stat(input)
  } catch (error) {
    if (isMissingPathError(error)) {
      throw new ConfigError(`Path does not exist: ${input}`, input)
    }
    throw error
  }
  const root = inputInfo.isFile() ? dirname(input) : input
  const configPaths = await discoverConfigs(input, options.recursive)
  if (configPaths.length === 0) {
    throw new ConfigError(`No Wrangler configuration found below ${root}.`, root)
  }

  const diagnostics: Diagnostic[] = []
  const workers: WorkerProject[] = []

  for (const configPath of configPaths) {
    const config = await readConfig(configPath)
    workers.push(await projectFromConfig(configPath, config, options.environment, diagnostics))
  }

  diagnostics.push(...diagnoseDuplicateNames(workers))
  diagnostics.push(...diagnoseDuplicateBindings(workers))
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

function isMissingPathError(error: unknown): boolean {
  return error instanceof Error
    && 'code' in error
    && error.code === 'ENOENT'
}

function diagnoseDuplicateNames(workers: WorkerProject[]): Diagnostic[] {
  const counts = new Map<string, number>()
  for (const worker of workers) counts.set(worker.name, (counts.get(worker.name) ?? 0) + 1)

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([name, count]) => {
      const worker = workers.find((item) => item.name === name)
      return {
        rule: 'WD008',
        severity: 'error',
        title: 'Worker name is duplicated',
        message: `${count} scanned configurations resolve to ${name}, so dependency targets are ambiguous.`,
        file: worker?.configPath ?? '',
        worker: name,
        fix: 'Give every Worker a unique effective name in the selected environment.',
      }
    })
}

function diagnoseDuplicateBindings(workers: WorkerProject[]): Diagnostic[] {
  return workers.flatMap((worker) => {
    const counts = new Map<string, number>()
    for (const binding of worker.bindings) {
      counts.set(binding.name, (counts.get(binding.name) ?? 0) + 1)
    }
    return [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([name, count]) => ({
        rule: 'WD009',
        severity: 'error' as const,
        title: 'Binding name is duplicated',
        message: `${worker.name} declares ${count} bindings named ${name}, so the runtime binding is ambiguous.`,
        file: worker.configPath,
        worker: worker.name,
        fix: 'Give every binding in this Worker a unique name.',
      }))
  })
}

async function projectFromConfig(
  configPath: string,
  root: ConfigObject,
  environment: string | undefined,
  diagnostics: Diagnostic[],
): Promise<WorkerProject> {
  const directory = dirname(configPath)
  const rootName = stringAt(root, 'name') ?? basename(dirname(configPath)) ?? 'worker'
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
      message: `${name} is missing ${secretState.missing.join(', ')} from its local secret sources.`,
      file: configPath,
      worker: name,
      fix: 'Add the missing names to the selected local secret file or process environment. Workers Doctor never reads or reports their values.',
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

  const localCount = bindings.filter(
    (binding) => !binding.remote && !NON_STATE_BINDINGS.has(binding.type),
  ).length
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

  for (const descriptor of OBJECT_BINDINGS) {
    const entries = objectAt(config, descriptor.key)
    if (!entries) continue
    for (const name of Object.keys(entries)) {
      if (name) bindings.push({ type: descriptor.type, name, remote: false })
    }
  }

  for (const descriptor of ARRAY_BINDINGS) {
    for (const item of arrayAt(config, descriptor.key)) {
      const name = stringAt(item, descriptor.name)
      if (!name) continue
      const target = descriptor.target
        ? stringAt(item, descriptor.target)
          ?? (descriptor.key === 'pipelines' ? stringAt(item, 'pipeline') : undefined)
        : undefined
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
    { key: 'assets', type: 'assets' },
    { key: 'browser', type: 'browser' },
    { key: 'images', type: 'images' },
    { key: 'media', type: 'media' },
    { key: 'stream', type: 'stream' },
    { key: 'version_metadata', type: 'version-metadata' },
    { key: 'websearch', type: 'web-search' },
  ]) {
    const item = objectAt(config, descriptor.key)
    if (!item) continue
    const name = stringAt(item, 'binding')
    if (name) bindings.push({ type: descriptor.type, name, remote: booleanAt(item, 'remote') })
  }

  const logForwarder = objectAt(config, 'logfwdr')
  if (logForwarder) {
    for (const item of arrayAt(logForwarder, 'bindings')) {
      const name = stringAt(item, 'name')
      if (name) bindings.push({ type: 'log-forwarder', name, remote: false })
    }
  }

  const unsafe = objectAt(config, 'unsafe')
  if (unsafe) {
    for (const item of arrayAt(unsafe, 'bindings')) {
      const name = stringAt(item, 'name')
      if (name) bindings.push({ type: 'unsafe', name, remote: false })
    }
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
  for (const name of required) {
    if (Object.hasOwn(process.env, name)) keys.add(name)
  }

  return {
    hasDevVars: Boolean(devFile),
    hasEnv: envFiles.length > 0,
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
    if (target === start) {
      cycles.add(canonicalCycle(nextPath))
    } else if (nextPath.length < graph.size + 1) {
      findCycles(start, target, graph, nextPath, cycles)
    }
  }
}

function canonicalCycle(nodes: string[]): string {
  const rotations = nodes.map((_, index) => [...nodes.slice(index), ...nodes.slice(0, index)])
  const canonical = rotations
    .map((rotation) => rotation.join(' -> '))
    .sort((a, b) => a.localeCompare(b))[0] ?? ''
  const first = canonical.split(' -> ')[0]
  return `${canonical} -> ${first}`
}

export function relativeResult(result: StackResult): StackResult {
  return {
    ...result,
    root: '.',
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
