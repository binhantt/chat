import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvFile();

function loadEnvFile() {
  const envFilePath = resolve(process.cwd(), '.env');

  if (!existsSync(envFilePath)) {
    return;
  }

  const envFileContent = readFileSync(envFilePath, 'utf8');
  const lines = envFileContent.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripWrappingQuotes(line.slice(separatorIndex + 1).trim());

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = value;
  }
}

function stripWrappingQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
