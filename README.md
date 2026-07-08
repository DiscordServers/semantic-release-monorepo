# @discordservers/semantic-release-monorepo

![Tests workflow](https://github.com/discordservers/semantic-release-monorepo/actions/workflows/tests.yml/badge.svg) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Apply [`semantic-release`'s](https://github.com/semantic-release/semantic-release) automatic publishing to a monorepo.

DiscordServers fork of [`pmowrer/semantic-release-monorepo`](https://github.com/pmowrer/semantic-release-monorepo). Differences from upstream:

- Git tags use the `<package-name>@<version>` format (e.g. `www@1.2.3`) instead of `<package-name>-v<version>`.
- Non-JS packages are supported via the `SEMANTIC_RELEASE_PACKAGE` environment variable, so a package with no `package.json` (e.g. a PHP app) can still be released.
- Release steps no longer crash when they run with no commits.
- Works with `semantic-release` v22 through v25.

## Why

The default configuration of `semantic-release` assumes a one-to-one relationship between a GitHub repository and an `npm` package.

This library allows using `semantic-release` with a single GitHub repository containing many `npm` packages.

## How

Instead of attributing all commits to a single package, commits are assigned to packages based on the files that a commit touched.

If a commit touched a file in or below a package's root, it will be considered for that package's next release. A single commit can belong to multiple packages and may trigger the release of multiple packages.

In order to avoid version collisions, generated git tags are namespaced using the given package's name: `<package-name>@<version>`.

## Install

Both `semantic-release` and `@discordservers/semantic-release-monorepo` must be accessible in each monorepo package.

```bash
npm install -D semantic-release @discordservers/semantic-release-monorepo
```

## Usage

Run `semantic-release` in an **individual monorepo package** and apply `@discordservers/semantic-release-monorepo` via the [`extends`](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#extends) option.

On the command line:

```bash
$ npx semantic-release -e @discordservers/semantic-release-monorepo
```

Or in the [release config](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration-file):

```json
{
  "extends": "@discordservers/semantic-release-monorepo"
}
```

NOTE: This library **CAN'T** be applied via the `plugins` option.

```json
{
  "plugins": [
    "@discordservers/semantic-release-monorepo" // This WON'T work
  ]
}
```

### With Yarn Workspaces

```bash
$ yarn workspaces run npx semantic-release -e @discordservers/semantic-release-monorepo
```

### With Lerna

The monorepo management tool [`lerna`](https://github.com/lerna/lerna) can be used to run `@discordservers/semantic-release-monorepo` across all packages in a monorepo with a single command:

```bash
lerna exec --concurrency 1 -- npx --no-install semantic-release -e @discordservers/semantic-release-monorepo
```

### With pnpm

[pnpm](https://pnpm.io/) has built-in [workspace](https://pnpm.io/workspaces) functionality for monorepos. Similarly to the above, you can use pnpm to make release in all packages:

```bash
pnpm -r --workspace-concurrency=1 exec -- npx --no-install semantic-release -e @discordservers/semantic-release-monorepo
```

Thanks to how [`npx's package resolution works`](https://github.com/npm/npx#description), if the repository root is in `$PATH` (typically true on CI), `semantic-release` and `@discordservers/semantic-release-monorepo` can be installed once in the repo root instead of in each individual package, likely saving both time and disk space.

## Advanced

This library modifies the `context` object passed to `semantic-release` plugins in the following way to make them compatible with a monorepo.

| Step             | Description                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `analyzeCommits` | Filters `context.commits` to only include the given monorepo package's commits.                                                                                                                                                                                                                                                                                                                                                  |
| `generateNotes`  | <ul><li>Filters `context.commits` to only include the given monorepo package's commits.</li><li>Modifies `context.nextRelease.version` to use the [monorepo git tag format](#how). The wrapped (default) `generateNotes` implementation uses this variable as the header for the release notes. Since all release notes end up in the same Github repository, using just the version as a header introduces ambiguity.</li></ul> |

### tagFormat

Pre-configures the [`tagFormat` option](https://github.com/semantic-release/semantic-release/blob/caribou/docs/usage/configuration.md#tagformat) to use the [monorepo git tag format](#how).

If you are using Lerna, you can customize the format using the following command:

```
"semantic-release": "lerna exec --concurrency 1 -- semantic-release -e @discordservers/semantic-release-monorepo --tag-format='${LERNA_PACKAGE_NAME}@\\${version}'"
```

Where `'${LERNA_PACKAGE_NAME}@\\${version}'` is the string you want to customize. By default it will be `<PACKAGE_NAME>@<VERSION>` (e.g. `foobar@1.2.3`).

### Non-JS packages (`SEMANTIC_RELEASE_PACKAGE`)

The package name is normally read from the package's `package.json`. For a package with no `package.json` (e.g. a PHP app), set the `SEMANTIC_RELEASE_PACKAGE` environment variable to the name you want; it takes precedence over `package.json` and drives both the git tag prefix and the release-notes header.

```bash
SEMANTIC_RELEASE_PACKAGE=my-php-app npx semantic-release -e @discordservers/semantic-release-monorepo
```
