#!/usr/bin/env node
/**
 * Deep Scan Setup Verification
 * 
 * Verifies that all deep scan tools are properly installed and configured.
 * Run this after installing dependencies to ensure everything is ready.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command) {
  const result = spawnSync('npx', [command, '--version'], {
    cwd: ROOT,
    shell: process.platform === 'win32',
    stdio: 'ignore',
  });
  return result.status === 0;
}

function checkFile(filePath) {
  return fs.existsSync(path.join(ROOT, filePath));
}

function checkScript(scriptName) {
  const pkg = require(path.join(ROOT, 'package.json'));
  return pkg.scripts && pkg.scripts[scriptName];
}

console.log('\n' + '='.repeat(70));
log('  Deep Scan Setup Verification', 'cyan');
console.log('='.repeat(70) + '\n');

let allPassed = true;

// Check Node.js version
log('1. Checking Node.js version...', 'yellow');
const nodeVersion = process.version;
const major = parseInt(nodeVersion.slice(1).split('.')[0]);
if (major >= 18) {
  log(`   ✅ Node.js ${nodeVersion} (required: >= 18)`, 'green');
} else {
  log(`   ❌ Node.js ${nodeVersion} (required: >= 18)`, 'red');
  allPassed = false;
}

// Check required tools
log('\n2. Checking installed tools...', 'yellow');
const tools = ['madge', 'jscpd', 'eslint', 'tsc'];
for (const tool of tools) {
  if (checkCommand(tool)) {
    log(`   ✅ ${tool} installed`, 'green');
  } else {
    log(`   ❌ ${tool} not found`, 'red');
    allPassed = false;
  }
}

// Check required files
log('\n3. Checking script files...', 'yellow');
const files = [
  'scripts/pre-launch-deep-scan.js',
  'scripts/true-deep-scan.js',
  'scripts/deep-code-reviewer.js',
  'eslint.config.mjs',
  'eslint.deep.config.mjs',
  'docs/DEEP_SCAN_GUIDE.md',
  'docs/DEEP_SCAN_QUICK_REF.md',
];
for (const file of files) {
  if (checkFile(file)) {
    log(`   ✅ ${file}`, 'green');
  } else {
    log(`   ❌ ${file} missing`, 'red');
    allPassed = false;
  }
}

// Check npm scripts
log('\n4. Checking npm scripts...', 'yellow');
const scripts = [
  'scan:pre-launch',
  'scan:pre-launch:quick',
  'scan:deep',
  'scan:quick',
  'scan:code',
  'lint:deep',
  'type-check:strict',
  'analyze:deps',
  'analyze:duplication',
];
for (const script of scripts) {
  if (checkScript(script)) {
    log(`   ✅ npm run ${script}`, 'green');
  } else {
    log(`   ❌ npm run ${script} not configured`, 'red');
    allPassed = false;
  }
}

// Check ESLint plugins
log('\n5. Checking ESLint plugins...', 'yellow');
const pkg = require(path.join(ROOT, 'package.json'));
const requiredPlugins = [
  'eslint-plugin-security',
  'eslint-plugin-sonarjs',
  'eslint-plugin-promise',
  'eslint-plugin-import',
  'eslint-plugin-react-hooks',
];
for (const plugin of requiredPlugins) {
  if (pkg.devDependencies && pkg.devDependencies[plugin]) {
    log(`   ✅ ${plugin}`, 'green');
  } else {
    log(`   ❌ ${plugin} not installed`, 'red');
    allPassed = false;
  }
}

// Check reports directory
log('\n6. Checking reports directory...', 'yellow');
const reportsDir = path.join(ROOT, 'deep-scan-reports');
if (fs.existsSync(reportsDir)) {
  log(`   ✅ deep-scan-reports/ exists`, 'green');
} else {
  log(`   ℹ️  deep-scan-reports/ will be created on first scan`, 'cyan');
}

// Print summary
console.log('\n' + '='.repeat(70));
if (allPassed) {
  log('✅ All checks passed! Deep scan tools are ready.', 'green');
  console.log('\nNext steps:');
  console.log('  1. Run a quick test: npm run scan:quick');
  console.log('  2. Before V1 launch: npm run scan:pre-launch');
  console.log('  3. Read docs: docs/DEEP_SCAN_GUIDE.md');
} else {
  log('❌ Some checks failed. Please fix the issues above.', 'red');
  console.log('\nTo fix:');
  console.log('  1. Run: npm install');
  console.log('  2. Ensure all scripts are in place');
  console.log('  3. Run this verification again');
}
console.log('='.repeat(70) + '\n');

process.exit(allPassed ? 0 : 1);
