import pc from 'picocolors'
import { terminalText } from './text.js'
import type { Diagnostic, StackResult } from './types.js'

export function formatHuman(result: StackResult, color = true): string {
  pc.isColorSupported = color
  const lines: string[] = []
  lines.push(pc.bold('Workers Doctor'))
  lines.push(
    `${result.summary.workers} worker${result.summary.workers === 1 ? '' : 's'} · ${result.summary.bindings} bindings · ${result.summary.remoteBindings} remote`,
  )
  if (result.environment) {
    lines.push(`Environment: ${pc.cyan(terminalText(result.environment))}`)
  }
  lines.push('')

  for (const worker of result.workers) {
    lines.push(
      `${pc.bold(terminalText(worker.name))}  ${pc.dim(terminalText(worker.configPath))}`,
    )
    if (worker.bindings.length === 0) {
      lines.push(`  ${pc.dim('no bindings')}`)
    } else {
      for (const binding of worker.bindings) {
        const target = binding.target ? ` → ${terminalText(binding.target)}` : ''
        const mode = binding.remote ? pc.yellow('remote') : pc.dim('local')
        lines.push(
          `  ${terminalText(binding.type).padEnd(16)} ${terminalText(binding.name)}${target}  ${mode}`,
        )
      }
    }
    lines.push('')
  }

  if (result.diagnostics.length === 0) {
    lines.push(`${pc.green('✓')} Stack is internally consistent.`)
  } else {
    for (const diagnostic of result.diagnostics) {
      lines.push(formatDiagnostic(diagnostic))
    }
  }

  lines.push('')
  lines.push(
    `${result.summary.errors} errors · ${result.summary.warnings} warnings · ${result.summary.infos} notices`,
  )
  return `${lines.join('\n')}\n`
}

function formatDiagnostic(item: Diagnostic): string {
  const icon =
    item.severity === 'error'
      ? pc.red('✕ ERROR')
      : item.severity === 'warning'
        ? pc.yellow('! WARNING')
        : pc.cyan('i NOTICE')
  const lines = [
    `${icon} ${item.rule}  ${pc.bold(terminalText(item.title))}`,
    `  ${terminalText(item.message)}`,
  ]
  if (item.fix) lines.push(`  ${pc.dim(`Fix: ${terminalText(item.fix)}`)}`)
  return lines.join('\n')
}

export function formatGitHub(result: StackResult): string {
  if (result.diagnostics.length === 0) return 'Workers Doctor: stack is internally consistent.\n'
  return `${result.diagnostics
    .map((item) => {
      const level = item.severity === 'info' ? 'notice' : item.severity
      return `::${level} file=${escape(item.file)},title=${escape(`${item.rule} ${item.title}`)}::${escape(item.message)}`
    })
    .join('\n')}\n`
}

function escape(value: string): string {
  return terminalText(value)
    .replaceAll('%', '%25')
    .replaceAll('\r', '%0D')
    .replaceAll('\n', '%0A')
    .replaceAll(':', '%3A')
    .replaceAll(',', '%2C')
}

export function formatDot(result: StackResult): string {
  const lines = ['digraph workers {', '  rankdir=LR;', '  node [shape=box, style="rounded"];']
  for (const worker of result.workers) {
    lines.push(`  "${dotEscape(worker.name)}" [label="${dotEscape(worker.name)}"];`)
  }
  for (const edge of result.edges) {
    const style = edge.remote ? ', style=dashed, color="#d97706"' : ''
    lines.push(
      `  "${dotEscape(edge.from)}" -> "${dotEscape(edge.to)}" [label="${dotEscape(edge.label)}"${style}];`,
    )
  }
  lines.push('}')
  return `${lines.join('\n')}\n`
}

function dotEscape(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replace(/[\u0000-\u001f\u007f]/g, (character) => {
      if (character === '\n') return '\\n'
      if (character === '\r') return '\\r'
      if (character === '\t') return '\\t'
      return ''
    })
}
