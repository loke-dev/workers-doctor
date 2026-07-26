#!/usr/bin/env node

// src/cli.ts
import { readFile as readFile3 } from "fs/promises";
import { fileURLToPath } from "url";

// src/analyze.ts
import { access, readFile as readFile2, readdir as readdir2, stat as stat2 } from "fs/promises";
import { basename as basename2, dirname, relative, resolve as resolve2 } from "path";

// src/config.ts
import { readFile } from "fs/promises";
import { extname } from "path";
import { parse as parseJsonc, printParseErrorCode } from "jsonc-parser";
import { parse as parseToml } from "smol-toml";
var ConfigError = class extends Error {
  constructor(message, filePath) {
    super(message);
    this.filePath = filePath;
  }
  filePath;
};
async function readConfig(filePath) {
  const source = await readFile(filePath, "utf8");
  try {
    if (extname(filePath) === ".toml") {
      return parseToml(source);
    }
    const errors = [];
    const value = parseJsonc(source, errors, { allowTrailingComma: true });
    if (errors.length > 0) {
      const first = errors[0];
      throw new Error(first ? printParseErrorCode(first.error) : "Invalid JSONC");
    }
    if (!isObject(value)) throw new Error("Configuration root must be an object");
    return value;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ConfigError(`Could not parse ${filePath}: ${message}`, filePath);
  }
}
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function objectAt(object, key) {
  const value = object[key];
  return isObject(value) ? value : void 0;
}
function arrayAt(object, key) {
  const value = object[key];
  return Array.isArray(value) ? value.filter(isObject) : [];
}
function stringAt(object, key) {
  const value = object[key];
  return typeof value === "string" ? value : void 0;
}
function booleanAt(object, key) {
  return object[key] === true;
}

// src/discover.ts
import { readdir, stat } from "fs/promises";
import { basename, resolve } from "path";
var CONFIG_NAMES = /* @__PURE__ */ new Set(["wrangler.jsonc", "wrangler.json", "wrangler.toml"]);
var SKIP_DIRECTORIES = /* @__PURE__ */ new Set([
  ".git",
  ".wrangler",
  "build",
  "coverage",
  "dist",
  "node_modules",
  ".next",
  ".output"
]);
async function discoverConfigs(inputPath, recursive) {
  const absolute = resolve(inputPath);
  const info = await stat(absolute);
  if (info.isFile()) {
    if (!CONFIG_NAMES.has(basename(absolute))) {
      throw new Error(`${absolute} is not a Wrangler configuration file.`);
    }
    return [absolute];
  }
  const results = [];
  await walk(absolute, recursive, results);
  return results.sort();
}
async function walk(directory, recursive, results) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isFile() && CONFIG_NAMES.has(entry.name)) {
      results.push(path);
    } else if (recursive && entry.isDirectory() && !SKIP_DIRECTORIES.has(entry.name)) {
      await walk(path, true, results);
    }
  }
}

// src/analyze.ts
var ARRAY_BINDINGS = [
  { key: "services", type: "service", name: "binding", target: "service" },
  { key: "agent_memory", type: "agent-memory", name: "binding", target: "namespace" },
  { key: "ai_search", type: "ai-search", name: "binding", target: "instance_name" },
  { key: "ai_search_namespaces", type: "ai-search-namespace", name: "binding", target: "namespace" },
  { key: "d1_databases", type: "d1", name: "binding", target: "database_name" },
  { key: "artifacts", type: "artifacts", name: "binding", target: "namespace" },
  { key: "kv_namespaces", type: "kv", name: "binding", target: "id" },
  { key: "r2_buckets", type: "r2", name: "binding", target: "bucket_name" },
  { key: "analytics_engine_datasets", type: "analytics", name: "binding", target: "dataset" },
  { key: "vectorize", type: "vectorize", name: "binding", target: "index_name" },
  { key: "hyperdrive", type: "hyperdrive", name: "binding", target: "id" },
  { key: "workflows", type: "workflow", name: "binding", target: "name" },
  { key: "mtls_certificates", type: "mtls-certificate", name: "binding", target: "certificate_id" },
  { key: "dispatch_namespaces", type: "dispatch-namespace", name: "binding", target: "namespace" },
  { key: "pipelines", type: "pipeline", name: "binding", target: "stream" },
  { key: "ratelimits", type: "rate-limit", name: "name", target: "namespace_id" },
  { key: "vpc_services", type: "vpc-service", name: "binding", target: "service_id" },
  { key: "send_email", type: "email", name: "name" },
  { key: "flagship", type: "flagship", name: "binding", target: "app_id" },
  { key: "secrets_store_secrets", type: "secret-store", name: "binding", target: "store_id" },
  { key: "vpc_networks", type: "vpc-network", name: "binding" },
  { key: "worker_loaders", type: "worker-loader", name: "binding" }
];
async function inspectStack(inputPath, options) {
  const input = resolve2(inputPath);
  const inputInfo = await stat2(input);
  const root = inputInfo.isFile() ? dirname(input) : input;
  const configPaths = await discoverConfigs(input, options.recursive);
  if (configPaths.length === 0) {
    throw new Error(`No Wrangler configuration found below ${root}.`);
  }
  const diagnostics = [];
  const workers = [];
  for (const configPath of configPaths) {
    const config = await readConfig(configPath);
    workers.push(await projectFromConfig(configPath, config, options.environment, diagnostics));
  }
  diagnostics.push(...diagnoseDuplicateNames(workers));
  const edges = buildEdges(workers);
  diagnostics.push(...diagnoseServices(workers, edges));
  diagnostics.push(...diagnoseCycles(edges, workers));
  diagnostics.sort((a, b) => {
    const severityOrder = { error: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity] || a.file.localeCompare(b.file);
  });
  return {
    root,
    ...options.environment ? { environment: options.environment } : {},
    workers,
    edges,
    diagnostics,
    summary: {
      workers: workers.length,
      bindings: workers.reduce((count, worker) => count + worker.bindings.length, 0),
      remoteBindings: workers.reduce(
        (count, worker) => count + worker.bindings.filter((binding) => binding.remote).length,
        0
      ),
      errors: diagnostics.filter((item) => item.severity === "error").length,
      warnings: diagnostics.filter((item) => item.severity === "warning").length,
      infos: diagnostics.filter((item) => item.severity === "info").length
    }
  };
}
function diagnoseDuplicateNames(workers) {
  const counts = /* @__PURE__ */ new Map();
  for (const worker of workers) counts.set(worker.name, (counts.get(worker.name) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([name, count]) => {
    const worker = workers.find((item) => item.name === name);
    return {
      rule: "WD008",
      severity: "error",
      title: "Worker name is duplicated",
      message: `${count} scanned configurations resolve to ${name}, so dependency targets are ambiguous.`,
      file: worker?.configPath ?? "",
      worker: name,
      fix: "Give every Worker a unique effective name in the selected environment."
    };
  });
}
async function projectFromConfig(configPath, root, environment, diagnostics) {
  const directory = dirname(configPath);
  const rootName = stringAt(root, "name") ?? basename2(dirname(configPath)) ?? "worker";
  const envs = objectAt(root, "env");
  const selected = environment && envs ? objectAt(envs, environment) : void 0;
  if (environment && !selected) {
    diagnostics.push({
      rule: "WD001",
      severity: "error",
      title: "Environment is not configured",
      message: `${rootName} has no env.${environment} configuration.`,
      file: configPath,
      worker: rootName,
      fix: `Add env.${environment} or choose one of the configured environments.`
    });
  }
  const effective = selected ?? root;
  const name = stringAt(effective, "name") ?? (environment ? `${rootName}-${environment}` : rootName);
  const bindings = collectBindings(effective);
  const requiredSecrets = requiredSecretNames(effective);
  const secretState = await inspectSecretFiles(directory, environment, requiredSecrets);
  if (secretState.hasDevVars && secretState.hasEnv) {
    diagnostics.push({
      rule: "WD004",
      severity: "warning",
      title: "Two local secret systems are present",
      message: `${name} has both .dev.vars and .env files. Wrangler does not load them as one combined source.`,
      file: configPath,
      worker: name,
      fix: "Choose .dev.vars or .env and remove the other local secret source."
    });
  }
  if (secretState.missing.length > 0) {
    diagnostics.push({
      rule: "WD005",
      severity: "warning",
      title: "Required local secrets are missing",
      message: `${name} is missing ${secretState.missing.join(", ")} in its selected local secret file.`,
      file: configPath,
      worker: name,
      fix: "Add the missing names to the local secret file. Workers Doctor never reads or reports their values."
    });
  }
  const remote = bindings.filter((binding) => binding.remote);
  if (remote.length > 0) {
    diagnostics.push({
      rule: "WD002",
      severity: "info",
      title: "Remote bindings will be used",
      message: `${name} connects ${remote.map((binding) => binding.name).join(", ")} to remote Cloudflare resources during local development.`,
      file: configPath,
      worker: name,
      fix: "Use staging resources or pass --local to Wrangler when remote access is not intended."
    });
  }
  const localCount = bindings.filter((binding) => !binding.remote && binding.type !== "service").length;
  if (remote.length > 0 && localCount > 0) {
    diagnostics.push({
      rule: "WD003",
      severity: "warning",
      title: "Local and remote state are mixed",
      message: `${name} combines ${remote.length} remote binding${remote.length === 1 ? "" : "s"} with ${localCount} locally simulated binding${localCount === 1 ? "" : "s"}.`,
      file: configPath,
      worker: name,
      fix: "Confirm that this mixed state is intentional before starting the stack."
    });
  }
  const serviceTargets = bindings.filter((binding) => binding.type === "service" && binding.target).map((binding) => binding.target);
  return {
    configPath,
    directory,
    rootName,
    name,
    bindings,
    serviceTargets,
    requiredSecrets,
    ...environment ? { environment } : {}
  };
}
function collectBindings(config) {
  const bindings = [];
  for (const descriptor of ARRAY_BINDINGS) {
    for (const item of arrayAt(config, descriptor.key)) {
      const name = stringAt(item, descriptor.name);
      if (!name) continue;
      const target = descriptor.target ? stringAt(item, descriptor.target) : void 0;
      bindings.push({
        type: descriptor.type,
        name,
        remote: booleanAt(item, "remote"),
        ...target ? { target } : {}
      });
    }
  }
  const queues = objectAt(config, "queues");
  if (queues) {
    for (const item of arrayAt(queues, "producers")) {
      const name = stringAt(item, "binding");
      if (!name) continue;
      const target = stringAt(item, "queue");
      bindings.push({
        type: "queue",
        name,
        remote: booleanAt(item, "remote"),
        ...target ? { target } : {}
      });
    }
  }
  const durableObjects = objectAt(config, "durable_objects");
  if (durableObjects) {
    for (const item of arrayAt(durableObjects, "bindings")) {
      const name = stringAt(item, "name");
      if (!name) continue;
      const target = stringAt(item, "class_name");
      bindings.push({
        type: "durable-object",
        name,
        remote: booleanAt(item, "remote"),
        ...target ? { target } : {}
      });
    }
  }
  for (const descriptor of [
    { key: "ai", type: "workers-ai" },
    { key: "assets", type: "assets" },
    { key: "browser", type: "browser" },
    { key: "images", type: "images" },
    { key: "media", type: "media" },
    { key: "version_metadata", type: "version-metadata" },
    { key: "websearch", type: "web-search" }
  ]) {
    const item = objectAt(config, descriptor.key);
    if (!item) continue;
    const name = stringAt(item, "binding");
    if (name) bindings.push({ type: descriptor.type, name, remote: booleanAt(item, "remote") });
  }
  return bindings.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
}
function requiredSecretNames(config) {
  const secrets = objectAt(config, "secrets");
  if (!secrets) return [];
  const required = secrets.required;
  return Array.isArray(required) ? required.filter((value) => typeof value === "string").sort() : [];
}
async function inspectSecretFiles(directory, environment, required) {
  const names = await readdir2(directory).catch(() => []);
  const devCandidates = environment ? [`.dev.vars.${environment}`, ".dev.vars"] : [".dev.vars"];
  const envCandidates = environment ? [`.env.${environment}.local`, ".env.local", `.env.${environment}`, ".env"] : [".env.local", ".env"];
  const devFile = devCandidates.find((name) => names.includes(name));
  const envFiles = envCandidates.filter((name) => names.includes(name));
  const keys = /* @__PURE__ */ new Set();
  if (devFile) {
    addDotEnvKeys(keys, await readFile2(resolve2(directory, devFile), "utf8"));
  } else {
    for (const file of envFiles.reverse()) {
      addDotEnvKeys(keys, await readFile2(resolve2(directory, file), "utf8"));
    }
  }
  return {
    hasDevVars: names.some((name) => name === ".dev.vars" || name.startsWith(".dev.vars.")),
    hasEnv: names.some((name) => name === ".env" || name.startsWith(".env.")),
    missing: required.filter((name) => !keys.has(name))
  };
}
function addDotEnvKeys(keys, source) {
  for (const line of source.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line);
    if (match?.[1]) keys.add(match[1]);
  }
}
function buildEdges(workers) {
  return workers.flatMap(
    (worker) => worker.bindings.filter((binding) => binding.target).map((binding) => ({
      from: worker.name,
      to: binding.target,
      label: `${binding.type}:${binding.name}`,
      remote: binding.remote
    }))
  );
}
function diagnoseServices(workers, edges) {
  const names = new Set(workers.map((worker) => worker.name));
  const byName = new Map(workers.map((worker) => [worker.name, worker]));
  return edges.filter((edge) => edge.label.startsWith("service:") && !names.has(edge.to)).map((edge) => {
    const worker = byName.get(edge.from);
    return {
      rule: "WD006",
      severity: "warning",
      title: "Service binding target is outside the stack",
      message: `${edge.from} points to ${edge.to}, but no scanned Worker resolves to that name.`,
      file: worker?.configPath ?? "",
      worker: edge.from,
      fix: "Scan the target Worker too, or confirm that the binding intentionally points to a deployed service."
    };
  });
}
function diagnoseCycles(edges, workers) {
  const serviceEdges = edges.filter((edge) => edge.label.startsWith("service:"));
  const graph = /* @__PURE__ */ new Map();
  for (const edge of serviceEdges) {
    const targets = graph.get(edge.from) ?? [];
    targets.push(edge.to);
    graph.set(edge.from, targets);
  }
  const cycles = /* @__PURE__ */ new Set();
  for (const worker of workers) {
    findCycles(worker.name, worker.name, graph, [], cycles);
  }
  return [...cycles].map((cycle) => {
    const first = cycle.split(" -> ")[0] ?? "";
    const worker = workers.find((item) => item.name === first);
    return {
      rule: "WD007",
      severity: "warning",
      title: "Service binding cycle detected",
      message: cycle,
      file: worker?.configPath ?? "",
      ...first ? { worker: first } : {},
      fix: "Confirm that the cycle is intentional and that every RPC or fetch call terminates."
    };
  });
}
function findCycles(start, current, graph, path, cycles) {
  if (path.includes(current)) return;
  const nextPath = [...path, current];
  for (const target of graph.get(current) ?? []) {
    if (target === start) {
      cycles.add(canonicalCycle(nextPath));
    } else if (nextPath.length < graph.size + 1) {
      findCycles(start, target, graph, nextPath, cycles);
    }
  }
}
function canonicalCycle(nodes) {
  const rotations = nodes.map((_, index) => [...nodes.slice(index), ...nodes.slice(0, index)]);
  const canonical = rotations.map((rotation) => rotation.join(" -> ")).sort((a, b) => a.localeCompare(b))[0] ?? "";
  const first = canonical.split(" -> ")[0];
  return `${canonical} -> ${first}`;
}
function relativeResult(result) {
  return {
    ...result,
    workers: result.workers.map((worker) => ({
      ...worker,
      configPath: relative(result.root, worker.configPath) || worker.configPath,
      directory: relative(result.root, worker.directory) || "."
    })),
    diagnostics: result.diagnostics.map((item) => ({
      ...item,
      file: relative(result.root, item.file) || item.file
    }))
  };
}

// src/dev.ts
import { spawn } from "child_process";
import { access as access2 } from "fs/promises";
import { dirname as dirname2, join } from "path";
async function buildDevCommands(result, startPort) {
  const ordered = orderWorkers(result);
  if (ordered.length > 0 && startPort + ordered.length - 1 > 65535) {
    throw new Error(
      `Port range ${startPort}-${startPort + ordered.length - 1} exceeds the maximum port 65535.`
    );
  }
  return Promise.all(
    ordered.map(async (worker, index) => {
      const runner = await detectRunner(worker);
      const args = [
        ...runner.prefix,
        "wrangler",
        "dev",
        "-c",
        worker.configPath,
        "--port",
        String(startPort + index)
      ];
      if (worker.environment) args.push("-e", worker.environment);
      return {
        worker: worker.name,
        cwd: worker.directory,
        command: runner.command,
        args,
        port: startPort + index
      };
    })
  );
}
async function detectRunner(worker) {
  const candidates = [
    { marker: "pnpm-lock.yaml", command: "pnpm", prefix: ["exec"] },
    { marker: "package-lock.json", command: "npm", prefix: ["exec", "--"] },
    { marker: "bun.lock", command: "bunx", prefix: [] },
    { marker: "bun.lockb", command: "bunx", prefix: [] },
    { marker: "yarn.lock", command: "yarn", prefix: [] }
  ];
  let directory = worker.directory;
  for (let depth = 0; depth < 8; depth += 1) {
    for (const candidate of candidates) {
      if (await exists(join(directory, candidate.marker))) {
        return { command: candidate.command, prefix: candidate.prefix };
      }
    }
    const parent = dirname2(directory);
    if (parent === directory) break;
    directory = parent;
  }
  return { command: "npx", prefix: ["--no-install"] };
}
function orderWorkers(result) {
  const byName = new Map(result.workers.map((worker) => [worker.name, worker]));
  const visited = /* @__PURE__ */ new Set();
  const active = /* @__PURE__ */ new Set();
  const output = [];
  const visit = (worker) => {
    if (visited.has(worker.name) || active.has(worker.name)) return;
    active.add(worker.name);
    for (const target of worker.serviceTargets) {
      const dependency = byName.get(target);
      if (dependency) visit(dependency);
    }
    active.delete(worker.name);
    visited.add(worker.name);
    output.push(worker);
  };
  for (const worker of result.workers) visit(worker);
  return output;
}
function formatDevPlan(commands) {
  const lines = ["Development plan", ""];
  for (const item of commands) {
    lines.push(`${item.worker.padEnd(24)} http://localhost:${item.port}`);
    lines.push(`  ${shellCommand(item.command, item.args)}`);
  }
  return `${lines.join("\n")}
`;
}
async function runDevCommands(commands) {
  if (commands.length === 0) return 0;
  const children = [];
  let closing = false;
  let exitCode = 0;
  const stop = (signalExitCode) => {
    if (signalExitCode !== void 0 && exitCode === 0) exitCode = signalExitCode;
    if (closing) return;
    closing = true;
    for (const child of children) child.kill("SIGTERM");
  };
  const interrupt = () => stop(130);
  const terminate = () => stop(143);
  return new Promise((resolve3) => {
    let remaining = commands.length;
    let resolved = false;
    const finish = () => {
      if (resolved || remaining !== 0) return;
      resolved = true;
      process.removeListener("SIGINT", interrupt);
      process.removeListener("SIGTERM", terminate);
      resolve3(exitCode);
    };
    process.once("SIGINT", interrupt);
    process.once("SIGTERM", terminate);
    for (const item of commands) {
      const child = spawn(item.command, item.args, {
        cwd: item.cwd,
        stdio: "inherit",
        env: process.env
      });
      children.push(child);
      child.once("error", () => {
        exitCode = 1;
        stop();
      });
      child.once("close", (code) => {
        if (typeof code === "number" && code !== 0) exitCode = code;
        remaining -= 1;
        if (!closing && code !== 0) stop();
        finish();
      });
    }
  });
}
function shellCommand(command, args) {
  return [command, ...args].map(quote).join(" ");
}
function quote(value) {
  return /^[A-Za-z0-9_./:@=-]+$/.test(value) ? value : `'${value.replaceAll("'", "'\\''")}'`;
}
function exists(path) {
  return access2(path).then(
    () => true,
    () => false
  );
}

// src/options.ts
var CliArgumentError = class extends Error {
};
var FORMATS = /* @__PURE__ */ new Set(["human", "json", "github", "dot"]);
function parseArgs(args) {
  let command = "inspect";
  let inputPath = ".";
  let environment;
  let recursive = true;
  let format = "human";
  let strict = false;
  let color = true;
  let dryRun = false;
  let startPort = 8787;
  let positionalSeen = false;
  const values = [...args];
  const first = values[0];
  if (first === "inspect" || first === "graph" || first === "dev") {
    command = first;
    values.shift();
  }
  if (command === "graph") format = "dot";
  for (let index = 0; index < values.length; index += 1) {
    const argument = values[index];
    if (!argument) continue;
    if (argument === "--env" || argument === "-e") {
      environment = requiredValue(values, ++index, argument);
    } else if (argument === "--format") {
      const value = requiredValue(values, ++index, argument);
      if (!FORMATS.has(value)) {
        throw new CliArgumentError(`Unknown format "${value}".`);
      }
      format = value;
    } else if (argument === "--json") {
      format = "json";
    } else if (argument === "--github") {
      format = "github";
    } else if (argument === "--dot") {
      format = "dot";
    } else if (argument === "--strict") {
      strict = true;
    } else if (argument === "--no-color") {
      color = false;
    } else if (argument === "--no-recursive") {
      recursive = false;
    } else if (argument === "--dry-run") {
      dryRun = true;
    } else if (argument === "--port") {
      const value = Number(requiredValue(values, ++index, argument));
      if (!Number.isInteger(value) || value < 1 || value > 65535) {
        throw new CliArgumentError("--port must be an integer between 1 and 65535.");
      }
      startPort = value;
    } else if (argument.startsWith("-")) {
      throw new CliArgumentError(`Unknown option "${argument}".`);
    } else if (!positionalSeen) {
      inputPath = argument;
      positionalSeen = true;
    } else {
      throw new CliArgumentError(`Unexpected argument "${argument}".`);
    }
  }
  return {
    command,
    inputPath,
    recursive,
    format,
    strict,
    color,
    dryRun,
    startPort,
    ...environment ? { environment } : {}
  };
}
function requiredValue(args, index, option) {
  const value = args[index];
  if (!value || value.startsWith("-")) {
    throw new CliArgumentError(`${option} requires a value.`);
  }
  return value;
}
function wantsJson(args) {
  return args.includes("--json") || args.some((value, index) => value === "--format" && args[index + 1] === "json");
}

// src/report.ts
import pc from "picocolors";
function formatHuman(result, color = true) {
  pc.isColorSupported = color;
  const lines = [];
  lines.push(pc.bold("Workers Doctor"));
  lines.push(
    `${result.summary.workers} worker${result.summary.workers === 1 ? "" : "s"} \xB7 ${result.summary.bindings} bindings \xB7 ${result.summary.remoteBindings} remote`
  );
  if (result.environment) lines.push(`Environment: ${pc.cyan(result.environment)}`);
  lines.push("");
  for (const worker of result.workers) {
    lines.push(`${pc.bold(worker.name)}  ${pc.dim(worker.configPath)}`);
    if (worker.bindings.length === 0) {
      lines.push(`  ${pc.dim("no bindings")}`);
    } else {
      for (const binding of worker.bindings) {
        const target = binding.target ? ` \u2192 ${binding.target}` : "";
        const mode = binding.remote ? pc.yellow("remote") : pc.dim("local");
        lines.push(`  ${binding.type.padEnd(16)} ${binding.name}${target}  ${mode}`);
      }
    }
    lines.push("");
  }
  if (result.diagnostics.length === 0) {
    lines.push(`${pc.green("\u2713")} Stack is internally consistent.`);
  } else {
    for (const diagnostic of result.diagnostics) {
      lines.push(formatDiagnostic(diagnostic));
    }
  }
  lines.push("");
  lines.push(
    `${result.summary.errors} errors \xB7 ${result.summary.warnings} warnings \xB7 ${result.summary.infos} notices`
  );
  return `${lines.join("\n")}
`;
}
function formatDiagnostic(item) {
  const icon = item.severity === "error" ? pc.red("\u2715 ERROR") : item.severity === "warning" ? pc.yellow("! WARNING") : pc.cyan("i NOTICE");
  const lines = [`${icon} ${item.rule}  ${pc.bold(item.title)}`, `  ${item.message}`];
  if (item.fix) lines.push(`  ${pc.dim(`Fix: ${item.fix}`)}`);
  return lines.join("\n");
}
function formatGitHub(result) {
  if (result.diagnostics.length === 0) return "Workers Doctor: stack is internally consistent.\n";
  return `${result.diagnostics.map((item) => {
    const level = item.severity === "info" ? "notice" : item.severity;
    return `::${level} file=${escape(item.file)},title=${escape(`${item.rule} ${item.title}`)}::${escape(item.message)}`;
  }).join("\n")}
`;
}
function escape(value) {
  return value.replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A").replaceAll(":", "%3A").replaceAll(",", "%2C");
}
function formatDot(result) {
  const lines = ["digraph workers {", "  rankdir=LR;", '  node [shape=box, style="rounded"];'];
  for (const worker of result.workers) {
    lines.push(`  "${dotEscape(worker.name)}" [label="${dotEscape(worker.name)}"];`);
  }
  for (const edge of result.edges) {
    const style = edge.remote ? ', style=dashed, color="#d97706"' : "";
    lines.push(
      `  "${dotEscape(edge.from)}" -> "${dotEscape(edge.to)}" [label="${dotEscape(edge.label)}"${style}];`
    );
  }
  lines.push("}");
  return `${lines.join("\n")}
`;
}
function dotEscape(value) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

// src/cli.ts
async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    process.stdout.write(help(await packageVersion()));
    return;
  }
  if (args.includes("--version") || args.includes("-v")) {
    process.stdout.write(`${await packageVersion()}
`);
    return;
  }
  try {
    const options = parseArgs(args);
    const rawResult = await inspectStack(options.inputPath, {
      recursive: options.recursive,
      ...options.environment ? { environment: options.environment } : {}
    });
    const result = relativeResult(rawResult);
    if (options.command === "dev") {
      if (result.summary.errors > 0 || options.strict && result.summary.warnings > 0) {
        process.stdout.write(formatHuman(result, options.color));
        process.stderr.write(
          options.strict && result.summary.errors === 0 ? "Workers Doctor refused to start a stack with warnings in strict mode.\n" : "Workers Doctor refused to start a stack with errors.\n"
        );
        process.exitCode = result.summary.errors > 0 ? 2 : 1;
        return;
      }
      const commands = await buildDevCommands(rawResult, options.startPort);
      process.stdout.write(formatDevPlan(commands));
      if (!options.dryRun) process.exitCode = await runDevCommands(commands);
      return;
    }
    const output = options.format === "json" ? `${JSON.stringify(result, null, 2)}
` : options.format === "github" ? formatGitHub(result) : options.format === "dot" ? formatDot(result) : formatHuman(result, options.color);
    process.stdout.write(output);
    setExitCode(result.summary, options.strict);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (wantsJson(args)) process.stdout.write(`${JSON.stringify({ error: message }, null, 2)}
`);
    else process.stderr.write(`Workers Doctor: ${message}
`);
    process.exitCode = error instanceof ConfigError || error instanceof CliArgumentError ? 1 : 2;
  }
}
function setExitCode(summary, strict) {
  if (summary.errors > 0) process.exitCode = 2;
  else if (strict && summary.warnings > 0) process.exitCode = 1;
}
async function packageVersion() {
  const packageFile = fileURLToPath(new URL("../package.json", import.meta.url));
  const parsed = JSON.parse(await readFile3(packageFile, "utf8"));
  if (typeof parsed !== "object" || parsed === null || !("version" in parsed) || typeof parsed.version !== "string") {
    throw new Error("Package version is missing or invalid.");
  }
  return parsed.version;
}
function help(version) {
  return `Workers Doctor v${version}

Inspect and safely run multi-Worker Cloudflare projects.

Usage:
  workers-doctor [inspect] [path] [options]
  workers-doctor graph [path] [options]
  workers-doctor dev [path] [options]

Options:
  -e, --env <name>       Resolve a named Workers environment
  --format <human|json|github|dot>
                         Select report output
  --json                 Alias for --format json
  --github               Emit GitHub Actions annotations
  --dot                  Emit a Graphviz dependency graph
  --strict               Fail when warnings are found
  --no-recursive         Inspect only the selected directory
  --dry-run              Print the dev process plan without starting it
  --port <number>        First local port for dev mode (default: 8787)
  --no-color             Disable ANSI colors
  -v, --version
  -h, --help

Exit codes:
  0  Stack is internally consistent
  1  Invalid input, or warnings with --strict
  2  Stack errors or an unexpected failure
`;
}
await main();
