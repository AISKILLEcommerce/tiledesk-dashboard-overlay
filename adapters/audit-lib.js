const fs = require('fs');
const path = require('path');

const DASHBOARD_REQUIRED_KEYS = [
  'WIDGET_BASE_URL',
  'botcredendialsURL',
  'SERVER_BASE_URL',
  'CHAT_BASE_URL',
  'chatEngine',
  'pushEngine',
  'logLevel'
];

const ENV_REQUIRED_KEYS = [
  'SERVER_BASE_URL',
  'CHAT_BASE_URL',
  'WIDGET_BASE_URL'
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readEnv(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const values = {};

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const index = trimmed.indexOf('=');
    if (index === -1) {
      return;
    }

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    values[key] = value;
  });

  return values;
}

function isUrlLike(value) {
  return typeof value === 'string' && /^(https?:\/\/|wss?:\/\/)/i.test(value);
}

function ensureTrailingSlash(value) {
  if (!value || typeof value !== 'string') {
    return value;
  }
  return value.endsWith('/') ? value : `${value}/`;
}

function validateDashboardConfig(config) {
  const errors = [];
  const warnings = [];

  DASHBOARD_REQUIRED_KEYS.forEach((key) => {
    if (!config[key]) {
      errors.push(`Missing required dashboard key: ${key}`);
    }
  });

  ['WIDGET_BASE_URL', 'SERVER_BASE_URL'].forEach((key) => {
    if (config[key] && !isUrlLike(config[key])) {
      errors.push(`${key} should be a URL.`);
    }
  });

  if (config.SERVER_BASE_URL && ensureTrailingSlash(config.SERVER_BASE_URL) !== config.SERVER_BASE_URL) {
    warnings.push('SERVER_BASE_URL should usually end with a trailing slash for consistency with upstream examples.');
  }

  if (config.WIDGET_BASE_URL && ensureTrailingSlash(config.WIDGET_BASE_URL) !== config.WIDGET_BASE_URL) {
    warnings.push('WIDGET_BASE_URL should usually end with a trailing slash.');
  }

  if (config.wsUrl && !/^wss?:\/\//i.test(config.wsUrl)) {
    errors.push('wsUrl should start with ws:// or wss://');
  }

  if (config.globalRemoteJSSrc && typeof config.globalRemoteJSSrc === 'string') {
    const sources = config.globalRemoteJSSrc.split(',').map((item) => item.trim()).filter(Boolean);
    sources.forEach((source) => {
      if (!isUrlLike(source)) {
        warnings.push(`Remote script source is not URL-like: ${source}`);
      }
    });
  }

  if (config.logLevel && !['ERROR', 'WARN', 'INFO', 'DEBUG'].includes(String(config.logLevel).toUpperCase())) {
    warnings.push(`Unexpected logLevel: ${config.logLevel}`);
  }

  return { errors, warnings };
}

function validateEnvConfig(config) {
  const errors = [];
  const warnings = [];

  ENV_REQUIRED_KEYS.forEach((key) => {
    if (!config[key]) {
      errors.push(`Missing required env key: ${key}`);
    }
  });

  Object.entries(config).forEach(([key, value]) => {
    if (/(_URL|_BASE_URL|^WS_URL$)/.test(key) && value && !isUrlLike(value)) {
      warnings.push(`${key} does not look like a full URL: ${value}`);
    }
  });

  return { errors, warnings };
}

function auditFiles(options) {
  const report = {
    generatedAt: new Date().toISOString(),
    files: [],
    errors: [],
    warnings: []
  };

  if (options.dashboardConfigPath) {
    const absolute = path.resolve(options.dashboardConfigPath);
    const dashboardConfig = readJson(absolute);
    const result = validateDashboardConfig(dashboardConfig);
    report.files.push({
      type: 'dashboard-config',
      path: absolute,
      checkedKeys: Object.keys(dashboardConfig).length
    });
    report.errors.push(...result.errors);
    report.warnings.push(...result.warnings);
  }

  if (options.envFilePath) {
    const absolute = path.resolve(options.envFilePath);
    const envConfig = readEnv(absolute);
    const result = validateEnvConfig(envConfig);
    report.files.push({
      type: 'env',
      path: absolute,
      checkedKeys: Object.keys(envConfig).length
    });
    report.errors.push(...result.errors);
    report.warnings.push(...result.warnings);
  }

  if (!options.dashboardConfigPath && !options.envFilePath) {
    report.errors.push('No input files were provided.');
  }

  report.ok = report.errors.length === 0;
  return report;
}

module.exports = {
  auditFiles,
  readEnv,
  readJson,
  validateDashboardConfig,
  validateEnvConfig
};
