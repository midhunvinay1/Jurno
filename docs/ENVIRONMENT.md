# Environment and secret safety

## Current browser edition

Jurno is a static browser application. It has no server process, does not load `.env` files, and has no required environment variables. Do not create a `.env` file in the expectation that the browser app will read it.

Optional LLM settings are entered through the local Settings screen and saved only in that browser profile. Jurno sends personal context only after the user invokes an LLM feature; it shows a disclosure before a non-local provider receives that context. Exports intentionally replace the stored provider key with an empty value.

Browser local storage is convenient local persistence, not an encrypted secret store. Prefer Ollama or another local endpoint. If you choose a cloud provider, use a low-risk development key and do not share the browser profile on a device you do not trust.

## Files that must stay local

The repository ignores the following categories:

- `.env`, `.env.*`, `.envrc`, credentials, secret folders, and private-key files;
- local databases, imports, exports, backups, attachments, and models; and
- personal Letterboxd exports and generated life backups.

Only [`.env.example`](../.env.example) is public, and it contains no configuration values or placeholders for a real secret.

## If a backend is added later

Keep provider secrets on the server or in the operating-system keychain, never in frontend bundles, static configuration, or `VITE_`/client-exposed variables. Validate required variables on server startup, redact them from logs and error messages, use a local `.env` only for development, and provide a checked-in example file with fictional values only.

Any backend must continue the current consent model: explain the exact data sent to a cloud provider, require an explicit opt-in, and treat LLM output as an editable suggestion rather than an autonomous archive change.

## Before publishing

Run:

```bash
npm run check
npm test
git status --ignored
git diff --cached
```

Stop and remove sensitive files from the staged change if the review shows a real name, journal entry, API key, local path, database, export, or backup.
