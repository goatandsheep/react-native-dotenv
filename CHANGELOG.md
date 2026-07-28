# Changelog

## [Unreleased]

### Fixed

- `process.env.X` is only inlined when `X` is defined in a `.env` file (plus `NODE_ENV` / `BABEL_ENV` / `envName`). Stops build-tooling leaks into the bundle without hardcoding tool-specific names. Host/CI-only values still work through `@env` imports ([#574](https://github.com/dotenvx/react-native-dotenv/issues/574)).

### Removed

- Removed deprecated `whitelist` and `blacklist` options. Use `allowlist` and `blocklist` instead.

## 3.4.12

## Older

### 2.0.0 (2018-08-31)

Moving from `v0.x` to `v2.x` changed both the setup and usage of this package. See the [migration guide](https://github.com/goatandsheep/react-native-dotenv/wiki/Migration-Guide) and the [story wiki page](https://github.com/goatandsheep/react-native-dotenv/wiki/Story-of-this-repo).
