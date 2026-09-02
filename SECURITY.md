# Security Policy

## Supported version

Security fixes are applied to the latest version on the default branch.

## Reporting a vulnerability

When this repository is hosted on GitHub, use its private security advisory reporting flow. Do not post vulnerabilities, API keys, exported journals, databases, or proof-of-concept data in a public issue.

Include the affected version, a minimal reproduction, expected and actual behavior, and any suggested mitigation. Maintainers will acknowledge reports, investigate, and coordinate disclosure before a fix is announced.

## Data-safety expectations

The browser edition is local-first but browser local storage is not encrypted. The planned desktop edition must use scoped filesystem access, versioned migrations, backups, and the operating-system keychain for provider credentials. See [Privacy](docs/PRIVACY.md) and [Architecture](docs/ARCHITECTURE.md).
