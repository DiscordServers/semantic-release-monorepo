import versionToGitTag from './version-to-git-tag.js';
import { describe, it, expect } from 'vitest';

describe('#versionToGitTag', () => {
  describe('if passed a falsy version', () => {
    it('returns null rather than creating a bad git-tag', async () => {
      expect(await versionToGitTag('')).toBe(null);
      expect(await versionToGitTag(undefined)).toBe(null);
      expect(await versionToGitTag(null)).toBe(null);
    });
  });

  describe('if passed a real version', () => {
    it('namespaces the tag with the package name using the @ format', async () => {
      process.env.SEMANTIC_RELEASE_PACKAGE = 'www';
      try {
        expect(await versionToGitTag('1.2.3')).toBe('www@1.2.3');
      } finally {
        delete process.env.SEMANTIC_RELEASE_PACKAGE;
      }
    });
  });
});
