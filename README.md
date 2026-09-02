# Jurno

**A local-first, open-source life log for the things that make up a life.**

Jurno is the open-source home for LIFE: a private timeline for films, books, series, games, study, courses, skills, rituals, goals, memories, and reflection. It is deliberately built for low friction: one line to log a moment, immediate and inspectable XP, no required account, no public feed, and no shame around missed days.

> This repository contains neutral demo data only. Your real exports, journals, API keys, and backups stay out of source control.

## What you can do

- Log life in one line: `f arrival (2016) *4.5`, `b piranesi p120/272 25m`, `s 45m linear algebra #exam`, `g hades 90m`, `t send the email`, or `n took a walk 20m`.
- Keep a Letterboxd-shaped library for films, books, series (with episodes), games, and a watchlist.
- Import standard Letterboxd CSV exports locally.
- Track study, courses, skills, practice time, and a focus timer.
- Write a private daily reflection with prompts plus freeform notes.
- Create small goals, tasks, rituals, milestones, and yearly horizons.
- Take a short breathwork pause with an optional local soundscape.
- Earn transparent XP, level up a companion, and collect achievements without punitive streak mechanics.
- Explore a timeline, archive, calendar, and lightweight analytics.
- Switch between seven accessible themes.
- Connect an optional Ollama or OpenAI-compatible LLM for user-triggered goal planning, reflection questions, and recommendations.
- Export or restore your complete local archive as JSON.

## Install and run locally

The browser edition has no runtime dependencies. You need [Node.js](https://nodejs.org/) 18 or newer and a modern browser; `npm install` is intentionally unnecessary.

```bash
git clone https://github.com/midhunvinay1/Jurno.git
cd Jurno
npm run dev
```

Then visit [http://127.0.0.1:4173](http://127.0.0.1:4173). You can also open `index.html` directly for a fully local preview, although the local server is the recommended development path.

Run the public-safety and data-contract checks before contributing:

```bash
npm run check
npm test
```

Your data stays in browser local storage for this browser and origin. Use **Settings → Export my data** regularly; provider keys are deliberately excluded from backups.

## Environment variables and secrets

This static browser edition does **not** read `.env` files or require any environment variables. The checked-in [`.env.example`](.env.example) is a safety notice, not configuration to fill in.

- Never add real API keys, journal exports, databases, backups, screenshots containing private data, or provider credentials to Git.
- Optional LLM settings are entered in **Settings** and stored only in that browser profile. A provider key is omitted from Jurno backups, but browser local storage is not a substitute for a production secret vault—use a low-risk development key or a local Ollama model.
- `.env`, `.env.*`, `.envrc`, credential folders, private-key files, local data folders, and common database files are ignored. Only `.env.example` is intentionally public.
- Before committing or publishing, run `npm run check`, inspect `git status --ignored`, and review `git diff --cached` for personal data and secrets.

See [environment and secret safety](docs/ENVIRONMENT.md), [Privacy](docs/PRIVACY.md), and [Security](SECURITY.md) for the full data boundary.

## Optional LLM setup

Jurno works fully offline. To use the optional coach, goal planner, and recommendations, open **Settings** and choose either a local Ollama endpoint (for example `http://localhost:11434`) or an OpenAI-compatible endpoint. Cloud requests require a clear in-app disclosure, return suggestions only, and never write into your archive automatically.

## Open-source roadmap

The browser edition is a functional, zero-install prototype. The next desktop release will use Tauri + SQLite with FTS and optional vector retrieval, while preserving the same interaction model and offline-first behavior.

- [Architecture](docs/ARCHITECTURE.md)
- [LLM behavior](docs/LLM_BEHAVIOR.md)
- [Privacy and data](docs/PRIVACY.md)
- [Importing Letterboxd](docs/IMPORTING_LETTERBOXD.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## LLM and privacy

LIFE works fully without an LLM. When configured, an LLM only responds to an explicit user action and returns suggestions—not autonomous writes. The browser prototype stores provider settings locally, so avoid adding a valuable production key. The planned desktop version uses the operating system keychain and requires an explicit opt-in before journal text can leave the device.

## Development

```bash
npm run check
npm run dev
```

This repository intentionally has no runtime dependencies in the browser edition. That keeps local development and GitHub Pages-style usage light.

## Publishing a fork

The repository is ready for a public GitHub repository: it includes MIT licensing, contribution and security guidance, CI, Dependabot configuration, synthetic import fixtures, and a privacy check. Follow the [release checklist](docs/OSS_RELEASE.md) before pushing a fork or tag.

## License

LIFE is released under the [MIT License](LICENSE).
