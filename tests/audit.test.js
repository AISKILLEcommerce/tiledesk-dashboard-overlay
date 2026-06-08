const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { auditFiles, readEnv, validateDashboardConfig } = require('../adapters/audit-lib');

test('validateDashboardConfig reports missing required keys', () => {
  const report = validateDashboardConfig({
    SERVER_BASE_URL: 'https://server.example.com/'
  });

  assert.ok(report.errors.some((item) => item.includes('WIDGET_BASE_URL')));
  assert.ok(report.errors.some((item) => item.includes('CHAT_BASE_URL')));
});

test('readEnv parses simple key value pairs', () => {
  const tempFile = path.join(os.tmpdir(), `tiledesk-env-${Date.now()}.env`);
  fs.writeFileSync(tempFile, 'SERVER_BASE_URL=https://server.example.com\nCHAT_BASE_URL=https://chat.example.com/chat\n');

  const parsed = readEnv(tempFile);
  assert.equal(parsed.SERVER_BASE_URL, 'https://server.example.com');
  assert.equal(parsed.CHAT_BASE_URL, 'https://chat.example.com/chat');
});

test('auditFiles passes on the provided overlay examples', () => {
  const root = path.resolve(__dirname, '..');
  const report = auditFiles({
    dashboardConfigPath: path.join(root, 'deployment', 'dashboard-config.example.json'),
    envFilePath: path.join(root, 'deployment', '.env.overlay.example')
  });

  assert.equal(report.ok, true);
  assert.equal(report.errors.length, 0);
});
