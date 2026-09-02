# Privacy and data

LIFE is local-first by default.

## Browser edition

- Data is stored in browser local storage for the local `http://localhost` origin.
- Exports are created only when the user clicks **Export my data**. Provider API keys are deliberately omitted from those exports.
- No analytics, account, public profile, or server sync is built in.
- LLM provider settings are local browser data; do not use a high-value production key in the prototype. The app asks before it sends personal context to a non-local provider.

## Desktop edition

The planned desktop app stores its database, attachments, and backups in an app-owned directory. Secrets are stored in the operating-system keychain. The app should explain exactly which text leaves the device before every cloud-assisted feature that could use journal or course content.

## Before opening an issue

Do not paste journal entries, API keys, full exports, or other sensitive personal data into public GitHub issues. Use the process in [SECURITY.md](../SECURITY.md) for vulnerabilities.
