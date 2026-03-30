#!/usr/bin/env node
/*
 * True Deep Scan Orchestrator
 * Runs multi-stage analysis and stores artifacts under deep-scan-reports/.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const REPORT_ROOT = path.join(ROOT, "deep-scan-reports");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const RUN_DIR = path.join(REPORT_ROOT, `true-deep-scan-${timestamp}`);

const args = new Set(process.argv.slice(2));
const quick = args.has("--quick");
const skipBuild = args.has("--skip-build") || quick;
const skipOptional = args.has("--skip-optional") || quick;

function log(message) {
  process.stdout.write(`${message}\n`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeText(fileName, content) {
  fs.writeFileSync(path.join(RUN_DIR, fileName), content, "utf8");
}

function runCommand(stepName, command, commandArgs, options = {}) {
  log(`\n== ${stepName} ==`);
  log(`$ ${command} ${commandArgs.join(" ")}`);

  const result = spawnSync(command, commandArgs, {
    cwd: ROOT,
    shell: process.platform === "win32",
    encoding: "utf8",
    env: process.env,
    timeout: options.timeoutMs || 0,
  });

  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  writeText(
    `${options.logFileBase || stepName.replace(/\s+/g, "-").toLowerCase()}.log`,
    `${stdout}\n${stderr}`.trim(),
  );

  if (result.error) {
    log(`FAIL: ${stepName}: ${result.error.message}`);
    return { ok: false, code: 1, stdout, stderr, error: result.error.message };
  }

  const ok = result.status === 0 || options.allowFailure;
  log(`${ok ? "PASS" : "FAIL"}: ${stepName} (exit ${result.status})`);

  return { ok, code: result.status || 0, stdout, stderr };
}

function commandExists(command) {
  const check = spawnSync(command, ["--version"], {
    cwd: ROOT,
    shell: process.platform === "win32",
    encoding: "utf8",
  });
  return check.status === 0;
}

function main() {
  ensureDir(REPORT_ROOT);
  ensureDir(RUN_DIR);

  const summary = {
    startedAt: new Date().toISOString(),
    runDir: RUN_DIR,
    mode: quick ? "quick" : "full",
    steps: [],
  };

  const steps = [
    {
      name: "Lint",
      command: "npm",
      args: ["run", "lint"],
      required: true,
      timeoutMs: 12 * 60 * 1000,
    },
    {
      name: "Strict Type Check",
      command: "npx",
      args: [
        "tsc",
        "--noEmit",
        "--strict",
        "--noUnusedLocals",
        "--noUnusedParameters",
        "--noImplicitReturns",
        "--noFallthroughCasesInSwitch",
      ],
      required: true,
      timeoutMs: 20 * 60 * 1000,
    },
    {
      name: "Dependency Audit",
      command: "npm",
      args: ["audit", "--production", "--json"],
      required: false,
      timeoutMs: 10 * 60 * 1000,
      allowFailure: true,
    },
    {
      name: "Bug Debugger Deep",
      command: "pwsh",
      args: [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        ".\\bugDebugger.ps1",
        "-Deep",
        "-SaveJson",
        "-ServerStartupTimeoutSec",
        "120",
        "-OutputFile",
        path.join(RUN_DIR, "bug-debugger-deep.md"),
      ],
      required: false,
      timeoutMs: 40 * 60 * 1000,
      allowFailure: true,
    },
    {
      name: "Custom Deep Code Review",
      command: "node",
      args: ["scripts/deep-code-reviewer.js"],
      required: true,
      timeoutMs: 60 * 60 * 1000,
    },
  ];

  if (!skipBuild) {
    steps.push({
      name: "Production Build",
      command: "npm",
      args: ["run", "build"],
      required: true,
      timeoutMs: 30 * 60 * 1000,
    });
  }

  if (!skipOptional) {
    if (commandExists("npx")) {
      steps.push({
        name: "Circular Dependency Scan",
        command: "npx",
        args: ["madge", "--circular", "--extensions", "ts,tsx", "src"],
        required: false,
        timeoutMs: 20 * 60 * 1000,
        allowFailure: true,
      });

      steps.push({
        name: "Duplication Scan",
        command: "npx",
        args: [
          "jscpd",
          "src",
          "--reporters",
          "json",
          "--output",
          path.join(RUN_DIR, "jscpd"),
        ],
        required: false,
        timeoutMs: 20 * 60 * 1000,
        allowFailure: true,
      });
    }
  }

  let failedRequired = false;

  for (const step of steps) {
    const result = runCommand(step.name, step.command, step.args, {
      timeoutMs: step.timeoutMs,
      allowFailure: step.allowFailure,
      logFileBase: step.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    });

    summary.steps.push({
      name: step.name,
      required: step.required,
      exitCode: result.code,
      ok: result.ok,
    });

    if (step.required && !result.ok) {
      failedRequired = true;
    }
  }

  summary.finishedAt = new Date().toISOString();
  summary.failedRequired = failedRequired;
  writeText("summary.json", JSON.stringify(summary, null, 2));

  const summaryMd = [
    "# True Deep Scan Summary",
    "",
    `- Started: ${summary.startedAt}`,
    `- Finished: ${summary.finishedAt}`,
    `- Mode: ${summary.mode}`,
    `- Run directory: ${RUN_DIR}`,
    "",
    "## Steps",
    ...summary.steps.map(
      (s) =>
        `- ${s.ok ? "PASS" : "FAIL"} | ${s.name} | exit ${s.exitCode}${s.required ? " | required" : " | optional"}`,
    ),
    "",
  ].join("\n");

  writeText("SUMMARY.md", summaryMd);

  log(`\nReports written to: ${RUN_DIR}`);
  process.exit(failedRequired ? 1 : 0);
}

main();
