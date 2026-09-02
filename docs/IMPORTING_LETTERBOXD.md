# Importing Letterboxd

LIFE supports local import of standard Letterboxd CSV files. Select files from the Library screen; the browser reads them locally and does not upload them anywhere.

## Supported sources

- `watched.csv`
- `ratings.csv`
- `diary.csv`
- `watchlist.csv`
- Film likes when selected from a standard likes export
- List exports, including files with the `Letterboxd list export v7` preamble

## Import behavior

1. Film catalog entries are matched by normalized title and year.
2. Watched and rating data are preserved independently.
3. Diary rows become individual activity events; rewatch state remains distinct from a first watch.
4. Official watchlists and custom lists remain separate collections.
5. Profile, deleted, orphaned, reviews, and comments should be opt-in recovery imports in the desktop edition because they can include private data.

## Open-source fixtures

Never commit your actual Letterboxd export. Add only synthetic, CC0 fixtures that cover quoted CSV values, List Export v7 metadata, rewatch events, overlapping watchlist/watched states, and idempotent re-imports.
