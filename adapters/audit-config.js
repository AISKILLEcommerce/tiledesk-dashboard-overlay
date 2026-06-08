#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { auditFiles } = require('./audit-lib');

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

function printHelp() {
  console.log(`
tiledesk-dashboard-overlay audit helper

Usage:
  node adapters/audit-config.js \\
    --dashboard-config ./deployment/dashboard-config.example.json \\
    --env-file ./deployment/.env.overlay.example

Options:
  --dashboard-config   Path to dashboard-config.json
  --env-file           Path to env file
  --json               Print JSON only
  --write-report       Optional path to write the JSON report
  --help               Show this help
`);
}

function printHuman(report) {
  console.log(`Audit OK: ${report.ok}`);
  console.log(`Checked files: ${report.files.length}`);

  if (report.errors.length > 0) {
    console.log('\nErrors:');
    report.errors.forEach((item) => console.log(`- ${item}`));
  }

  if (report.warnings.length > 0) {
    console.log('\nWarnings:');
    report.warnings.forEach((item) => console.log(`- ${item}`));
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const report = auditFiles({
    dashboardConfigPath: args['dashboard-config'],
    envFilePath: args['env-file']
  });

  if (args['write-report']) {
    const target = path.resolve(args['write-report']);
    fs.writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`);
  }

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHuman(report);
  }

  if (!report.ok) {
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
