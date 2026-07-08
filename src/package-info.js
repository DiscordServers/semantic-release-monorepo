import readPkg from 'read-pkg';

/**
 * Resolve the package name for the release.
 *
 * Prefers the `SEMANTIC_RELEASE_PACKAGE` env var so non-JS packages (e.g. a PHP
 * app with no package.json) can still be released — the JS `package.json` name
 * is only used as a fallback when the env var is not set.
 */
const getName = async () => {
  if (process.env.SEMANTIC_RELEASE_PACKAGE) {
    return process.env.SEMANTIC_RELEASE_PACKAGE;
  }
  const { name } = await readPkg();
  return name;
};

const getNameSync = () => {
  if (process.env.SEMANTIC_RELEASE_PACKAGE) {
    return process.env.SEMANTIC_RELEASE_PACKAGE;
  }
  return readPkg.sync().name;
};

export { getName, getNameSync };
