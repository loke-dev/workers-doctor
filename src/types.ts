export type Severity = 'error' | 'warning' | 'info'

export type OutputFormat = 'human' | 'json' | 'github' | 'dot'

export interface Diagnostic {
  rule: string
  severity: Severity
  title: string
  message: string
  file: string
  worker?: string
  fix?: string
}

export interface Binding {
  type: string
  name: string
  target?: string
  remote: boolean
}

export interface WorkerProject {
  configPath: string
  directory: string
  rootName: string
  name: string
  environment?: string
  bindings: Binding[]
  serviceTargets: string[]
  requiredSecrets: string[]
}

export interface StackEdge {
  from: string
  to: string
  label: string
  remote: boolean
}

export interface StackSummary {
  workers: number
  bindings: number
  remoteBindings: number
  errors: number
  warnings: number
  infos: number
}

export interface StackResult {
  root: string
  environment?: string
  workers: WorkerProject[]
  edges: StackEdge[]
  diagnostics: Diagnostic[]
  summary: StackSummary
}

export interface InspectOptions {
  environment?: string
  recursive: boolean
}

export interface CliOptions extends InspectOptions {
  command: 'inspect' | 'graph' | 'dev'
  inputPath: string
  format: OutputFormat
  strict: boolean
  color: boolean
  dryRun: boolean
  startPort: number
}

