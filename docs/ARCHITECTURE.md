# Architecture

## Today: browser edition

The repository currently ships a dependency-free browser application:

```text
index.html + styles.css + app.js
        ↓
browser local storage
        ↓
exportable JSON archive
```

All core actions work offline. The UI uses a deterministic capture parser first; no LLM or network request can block an activity from being recorded.

## Desktop direction

The production desktop edition should use Tauri, a narrow Rust command layer, and a single SQLite database. A recommended layout is:

```text
Tauri webview
  └─ typed IPC commands
       └─ Rust domain services
            └─ SQLite + FTS5 + optional sqlite-vec
                 ├─ activity ledger and XP events
                 ├─ media, courses, skills, rituals, and archive
                 ├─ journal entries and local embeddings
                 └─ import jobs and backups
```

### Non-negotiable decisions

- Keep one canonical, append-only activity and XP ledger.
- Use versioned, transactional SQLite migrations and automatic backups.
- Keep imports, retrieval, LLM providers, and media metadata behind explicit adapters.
- Do not grant broad filesystem access; users choose import/export files through native dialogs.
- Store API secrets in the operating-system keychain—not the renderer or database.
- Make vector search optional. FTS search must remain useful without an embedding model.

## Migrating older local LIFE installs

Earlier prototypes may have separate tables for hero state, tasks, media, episodes, skills, streaks, journal, events, resolutions, achievements, and breathwork. A migration should import each into the new event-ledger model, preserve source IDs as provenance, and show a review screen before committing. Poster blobs should be exported separately because browser IndexedDB data is not part of a SQLite database.
