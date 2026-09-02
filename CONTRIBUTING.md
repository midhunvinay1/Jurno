# Contributing to LIFE

Thank you for helping make a private, humane life log that works for more people.

## Start locally

Use Node.js 20 or later. No package installation is required.

```bash
npm run check
npm test
npm run dev
```

Open the local address printed by the server. Try the feature you changed with a fresh browser profile as well as with existing saved data, because LIFE must preserve user history across upgrades.

## Contribution principles

- Keep the default experience useful without an account, network connection, LLM, or paid service.
- Treat journal entries, exports, and API keys as sensitive. Never add real personal data, screenshots containing it, or credentials to a pull request.
- Prefer small, reversible interactions. XP should be understandable and never punish a missed day.
- Keep accessibility in mind: visible focus states, keyboard access, legible contrast, plain language, and reduced cognitive load.
- Do not add analytics, ads, or background LLM calls without an explicit product discussion and opt-in design.

## Before opening a pull request

1. Run `npm run check` and `npm test`.
2. Explain the user-facing behavior and any privacy impact.
3. Add or update a focused test when changing behavior that can be checked without a browser.
4. Keep generated folders, local databases, imports, backups, and `.env` files out of Git.

For substantial architectural work, open an issue first so the local-first data model stays coherent.
