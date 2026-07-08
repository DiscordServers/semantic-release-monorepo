import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fileURLToPath } from 'url';
import path from 'path';
import { getName, getNameSync } from './package-info.js';

const forkRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

describe('package name resolution', () => {
  const originalPkg = process.env.SEMANTIC_RELEASE_PACKAGE;
  const originalCwd = process.cwd();

  beforeEach(() => {
    delete process.env.SEMANTIC_RELEASE_PACKAGE;
  });

  afterEach(() => {
    if (originalPkg === undefined) {
      delete process.env.SEMANTIC_RELEASE_PACKAGE;
    } else {
      process.env.SEMANTIC_RELEASE_PACKAGE = originalPkg;
    }
    process.chdir(originalCwd);
  });

  it('prefers SEMANTIC_RELEASE_PACKAGE over package.json (non-JS packages)', async () => {
    process.env.SEMANTIC_RELEASE_PACKAGE = 'php-api';
    expect(await getName()).toBe('php-api');
    expect(getNameSync()).toBe('php-api');
  });

  it('falls back to the package.json name when the env var is unset', async () => {
    // Pin cwd to the fork root — sibling specs chdir into temp git repos and
    // don't restore, so an unset cwd would read a fixture package.json.
    process.chdir(forkRoot);
    expect(await getName()).toBe('@discordservers/semantic-release-monorepo');
    expect(getNameSync()).toBe('@discordservers/semantic-release-monorepo');
  });
});
