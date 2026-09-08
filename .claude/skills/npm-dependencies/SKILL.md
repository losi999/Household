---
name: npm-dependencies
description: Best practices for adding, upgrading, auditing, and removing JavaScript package dependencies in this repo. Use whenever the task involves package.json or a lockfile — installing a new package, bumping versions, resolving a peer-dependency or version conflict, fixing an audit/CVE finding, deduping, pruning unused deps, choosing between a dependency and writing it yourself, or debugging "works locally but not in CI" install problems.
---

# Managing dependencies

## Repo facts (verify before relying on them)

- **Package manager: Yarn Classic (v1).** `yarn.lock` says `# yarn lockfile v1`. Never run `npm install` — it creates a competing `package-lock.json` and a differently-resolved tree.
- **Four independent install roots**, each with its own `package.json` + `yarn.lock`, not a workspace:
  - `.` — API/Lambda code, shared code, tooling
  - `web/` — current Angular apps (`household`, `hairdressing`, `shared`)
  - `web_legacy/` — the old Angular app being retired
  - `test/`
  Root scripts shell into the others (`cd web && yarn build household`). A dependency change in `web/` needs its install run in `web/`.
- **Versions are pinned exactly** — `"mongoose": "9.3.3"`, no `^` or `~`. Preserve this.

## Core rules

### Pin exact versions
Add with `yarn add --exact <pkg>` (`-E`) so the range never drifts. The lockfile pins the tree, but an exact range in `package.json` also makes the intended version obvious in diffs and review, and stops a stray `yarn upgrade` from silently moving a minor.

### Commit the lockfile, always
Every dependency change is a two-file diff: `package.json` + `yarn.lock`. A `package.json` change without its lockfile change means CI resolves something different from local. Never hand-edit `yarn.lock` — change `package.json` and let Yarn regenerate it.

### Reproducible installs in CI
CI should install with `yarn install --frozen-lockfile`, which fails rather than silently updating `yarn.lock` when it disagrees with `package.json`. If CI fails there, the fix is to commit the correct lockfile, not to drop the flag.

### dependencies vs devDependencies
- `dependencies` — imported by code that ships and runs at runtime (Lambda handlers, browser bundles).
- `devDependencies` — build, test, lint, and type-only tooling: `typescript`, `esbuild`, `vitest`, `eslint`, all `@types/*`, `rimraf`, `@faker-js/faker`.

Misplacing a runtime dep in `devDependencies` produces a `MODULE_NOT_FOUND` only in a production install. Misplacing dev tooling in `dependencies` bloats the deployment artifact.

Two wrinkles specific to this repo:
- The API is **bundled by esbuild** (`build.cjs`), so most runtime code ends up inline and `node_modules` is not shipped as-is. Anything marked external in the bundle config, or provided by a Lambda **layer** (`layers/`), still has to resolve at runtime — check `build.cjs` and `layers/` before assuming a package is safe to bundle or safe to drop.
- The AWS SDK v3 (`@aws-sdk/*`) is partly provided by the Lambda runtime, but the provided version drifts. Keep the `@aws-sdk/*` packages on **one identical version** (currently `3.1021.0`) and bump them as a set — mixed versions pull duplicate copies of `@smithy/*` and cause confusing type errors.

### Adding a dependency is a decision, not a reflex
Before adding one, ask:
- Does an existing dep already cover it? Check `package.json` first — e.g. `undici` for HTTP, `ajv` for schema validation, `moment-timezone` for dates.
- Is it a few lines of code? A tiny package is a permanent supply-chain and upgrade liability.
- Is it maintained? Look at last publish date, open-issue trend, weekly downloads, whether it has a types story (bundled types beat a separate `@types/*`).
- Does it match module format and platform? The root is `"type": "module"` (ESM) targeting Node; `web/` targets browsers. A CommonJS-only or Node-only package in a browser bundle is a build failure waiting to happen.
- Does it drag in a large transitive tree? `yarn info <pkg> dependencies` before committing.

### Keep types in lockstep with their runtime package
`@types/x` must match the major (ideally minor) of `x`. When bumping one, bump the other in the same change. Prefer packages that ship their own types and drop the `@types/*` shim when they do.

## Workflows

### Add
```bash
yarn add --exact <pkg>            # runtime dep
yarn add --exact --dev <pkg>      # tooling
```
Run it in the correct root (`cd web` for an Angular dep). Then build and test that root, and commit `package.json` + `yarn.lock` together.

For Angular deps in `web/`, prefer `yarn ng add <pkg>` when the package ships a schematic — it wires up config that a plain install won't.

### Inspect before upgrading
```bash
yarn outdated            # what's behind, and how far
yarn info <pkg> versions # available versions
npm view <pkg> --json    # registry metadata (read-only; safe with Yarn)
```
`npm view`/`npm info` only read the registry and touch nothing on disk, so they're fine in a Yarn repo. Avoid any `npm` command that writes (`install`, `update`, `ci`, `audit fix`).

### Upgrade
Upgrade in small, reviewable batches — never "bump everything" in one commit.

1. Group related packages and bump them together: all `@aws-sdk/*`, all `@vitest/*` + `vitest`, all `@angular*`, all `@typescript-eslint/*` + `eslint`.
2. Read the changelog/release notes for majors before bumping. Breaking changes in a build tool (esbuild, typescript, vitest) usually show up as config errors, not runtime errors.
3. `yarn upgrade <pkg>@<exact-version>` (Yarn Classic's `upgrade` respects the range in `package.json`; naming the exact version avoids surprises).
4. Verify: `yarn lint`, `yarn build:api`, `yarn test:api` for the root; the matching `web` scripts for `web/`.
5. One logical upgrade per commit, so a bisect points at a single package.

Angular upgrades are their own thing: use `yarn ng update` in `web/`, one major at a time, following the official upgrade guide. Don't hand-bump `@angular/*` versions in `package.json`.

### Audit and vulnerabilities
```bash
yarn audit                       # full report
yarn audit --level high          # signal only
```
Triage rather than mass-fix. For each finding, ask whether the vulnerable code path is actually reachable — a dev-only or build-time dependency with a ReDoS advisory is not the same risk as a reachable runtime parser. Do **not** run `npm audit fix` here; it will rewrite the tree with npm semantics. Fix by bumping the direct dependency that pulls the vulnerable transitive one; if the direct dep has no fixed release, use a Yarn Classic `resolutions` field in `package.json` as a documented, temporary override with a comment explaining why and when it can go.

### Remove
```bash
yarn remove <pkg>
```
Before removing, confirm nothing imports it — including config files, `build.cjs`, `vitest.config.ts`, `.eslintrc.json`, and CI (`.circleci/config.yml`) — since a grep for `import` alone misses those. Then reinstall from scratch and run the build.

### Debugging install problems
- Diverging local vs CI behavior → compare Node versions, then reinstall clean: `rm -rf node_modules && yarn install --frozen-lockfile`.
- Duplicate versions of one package in the tree → `yarn why <pkg>` shows every requester; fix by aligning the direct deps, `yarn dedupe`-style resolution, or a `resolutions` entry.
- Peer-dependency warnings are real signals in a pinned repo — resolve them rather than muting them; a mismatched peer commonly surfaces later as a subtle type or runtime error.
- Deleting `yarn.lock` to "fix" an install is almost never the right move — it silently upgrades the entire tree.

## Reviewing a dependency change

- [ ] `package.json` and `yarn.lock` changed together
- [ ] No `package-lock.json` introduced
- [ ] Exact version, no `^`/`~`
- [ ] Correct section (`dependencies` vs `devDependencies`)
- [ ] Correct install root
- [ ] `@types/*` matches its runtime package
- [ ] Grouped packages moved as a set (`@aws-sdk/*`, `vitest`/`@vitest/*`, `@angular*`)
- [ ] Lint, build, and tests run for the affected root
- [ ] Any `resolutions` entry has a comment saying why and when it can be removed
