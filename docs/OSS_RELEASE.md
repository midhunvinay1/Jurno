# Open-source release checklist

Before publishing a fork or release:

1. Run `npm run check` and `npm test`.
2. Confirm `git status --ignored` shows no personal exports, local databases, backups, `.env` files, or build artifacts staged for commit.
3. Review `git diff --cached` for names, paths, API keys, screenshots, and journal text.
4. Turn on GitHub private vulnerability reporting, Dependabot alerts, and branch protection for the default branch.
5. Create a release only from a tagged, checked commit.

The repository's CI intentionally has no dependency installation step because the browser edition has no runtime packages. If dependencies are added later, pin them with a lockfile and include them in dependency review.
